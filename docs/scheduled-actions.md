# Scheduled Actions

## Problem Statement

Sometimes it is necessary to verify a UI scenario where one has to assert a UI control has appeared on the screen and then perform a decision action on this control. An example of such control might be a notification or any other popup that automatically disappears shortly after being shown. The WebDriver protocol uses HTTP REST API to communicate with clients. This means if you want to assert the existence of the above popup in your test script or perform any action on it then it is necessary to send an HTTP request to the server and receive an answer from it. Furthermore, this is needed for each particular command or assertion you want to perform, e.g. click, find element, get text, etc. The time an HTTP request needs to reach the server and then its response to reach the client is the roundtrip time, and the length of it depends on many factors. For some complex setups the roundtrip duration may even be counted in seconds, which makes it impossible to quickly handle an UI element, because it would already not exist/disappear by the time your next request reaches the server.

## Scheduled Actions Concept

In order to address the problem above we have created the Scheduled Actions concept. The main idea there is to run the action code on the server side in asynchronous manner and only retrieve the detailed execution history if needed. `Action` is this context means emulating a gesture, or taking a screenshot, or taking a xml page source. More actions could be added later. The `scheduled` means after you create an action, or rather describe it in JSON, it is parsed and stored by the server for the further async execution. The client does not have any control over the previously scheduled action and can only unschedule it later or fetch its execution history. All actions are being scheduled on the main UI thread. All scheduled actions are reset automatically upon a new session creation.

This feature is available in the UIA2 driver since version *2.26.0*

## mobile: scheduleAction

Adds a new action to the list of scheduled actions.

### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
name | string | yes | The unique name of the action. | popupHandlingAction
steps | ActionStep[] | yes | One or more action steps to execute. Steps are executed in sequential order. All steps are executed even if any of them fails. The execution is considered failed if at least one step fails. | Check [Action Steps](#action-steps)
maxPass | number | no | If set to a number greater than zero then the action will stop rescheduling itself after it passes the desired number of times | 1
maxFail | number | no | If set to a number greater than zero then the action will stop rescheduling itself after it fails the desired number of times | 1
times | number | no | How many times the action must be executed itself. 1 by default | 10
intervalMs | number | no | How long the interval in milliseconds between the next action reschedule should be. 1000 ms by default. | 100
maxHistoryItems | number | no | The maximum size of the history items array that are stored for this action. Each action execution creates a new history item. All items are sorted in descending order by action execution timestamp. If the amount of executions reaches `maxHistoryItems` value then the oldest history item gets deleted. Be careful to not set this parameter to large values as you might get out of memory issues. 20 history items are being stored for each action by default. | 100

#### Action Steps

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
type | string | yes | One of supported step types: `gesture`, `source`, `screenshot`. | gesture
name | string | yes | Step name. It must not be unique, but is useful to track the step execution history. | click
payload | map | yes | Step payload. The payload format depends on the actual step type. | Check on [Step Payload](#step-payload) below

#### Step Payload

Each step payload is required to contain the `subtype` item. Then the combination of step's `type` and `subtype` defines the actual payload content:

Type | Subtype | Description | Payload Example
--- | --- | --- | ---
gesture | click | The payload is expected to be similar to the one the [mobile: clickGesture](./android-mobile-gestures.md#mobile-clickgesture) requires. | {subtype: 'click', locator: {strategy: 'id', selector: 'buttonIdentifier'}}
gesture | longClick | The payload is expected to be similar to the one the [mobile: longClickGesture](./android-mobile-gestures.md#mobile-longclickgesture) requires. | {subtype: 'click', locator: {strategy: 'accessbility id', selector: 'buttonIdentifier'}}
gesture | doubleClick | The payload is expected to be similar to the one the [mobile: doubleClickGesture](./android-mobile-gestures.md#mobile-doubleclickgesture) requires.  | {subtype: 'click', elementId: 'yolo', x: 150, y: 200}
source | xml | The payload does not need to contain any other items. | {subtype: 'xml'}
screenshot | png | The payload does not need to contain any other items. | {subtype: 'png'}

## mobile: getActionHistory

Returns the history of executions for the particular action.

### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
name | string | yes | The unique name of the action. | popupHandlingAction

### Returned Result

The history of executions of the particular action. An error is thrown if no action with the given name has been scheduled before calling this API or if it has been already unscheduled.

The returned result map has the following items:

Name | Type | Description | Example
--- | --- | --- | ---
repeats | number | The number of times this action has been repeated so far. | 1
stepResults | list&lt;list&lt;map&gt;&gt; | The history of step executions for each action run. Items in this list are sorted by execution timestamp in descending order. The maximum length of the list is limited by `maxHistoryItems` action value | See below

The result of each action step is represented by the map inside each `stepResulsts` array item containing the following items:

Name | Type | Description | Example
--- | --- | --- | ---
name | string | The name of the corresponding step. | clickStep
type | string | One of supported step typed. | gesture
timestamp | number | The Unix timestamp in milliseconds when the step started its execution. | 1685370112000
passed | boolean | Whether the step has passed, e.g. no exceptions occurred during its execution. | true
result | any | The actual step result. Depends on the step type and subtype. Might be null. Always null if exception is not null. | something
exception | map | If an exception happens during the step execution then this map will contain the following items: name (the exception class name), message (the actual exception message), stacktrace (full exception stacktrace). If no exceptions occurs during step execution then the value of this item is always null | {name: 'java.lang.Exception', message: 'Bad things happen', stacktrace: 'happened somewhere'}

## mobile: unscheduleAction

Unschedules an action from the async execution and returns its history.

### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
name | string | yes | The unique name of the action. | popupHandlingAction

### Returned Result

The same as in [mobile: getActionHistory](#mobile-getactionhistory) endpoint

## Usage Example

Let's assume our application under test shows a short-living popup with two buttons to either accept or reject it.
At first, we need to figure out how the popup looks like in the page source to build element locators. For that we are going to create an action that periodically retrieves page source snapshots:

```python
driver.execute_script('mobile: scheduleAction', {
  'name': 'myPopupHandlingAction',
  'steps': [{
    'type': 'source',
    'name': 'fetchPageSourceStep',
    'payload': {
      'subtype': 'xml'
    }
  }],
  'intervalMs': 1000,
  'times': 30,
  'maxHistoryItems': 30,
})

# doing some other stuff which is supposed to trigger the popup for the next 30 seconds

history: Dict[str, Any] = driver.execute_script('mobile: unscheduleAction', {
  'name': 'myPopupHandlingAction',
})
```

In the example above we have scheduled an action which takes UI hierarchy snapshot every second. Eventually we can
debug the value of `history` list and inspect each item for the presence of our expected popup element. After we have figured out locators for its Accept button our action may be updated to:

```python
driver.execute_script('mobile: scheduleAction', {
  'name': 'myPopupHandlingAction',
  'steps': [{
    'type': 'gesture',
    'name': 'acceptPopupStep',
    'payload': {
      'subtype': 'click'
      'locator': {
        'strategy': 'id',
        'selector': 'acceptButtonIdentifier',
      }
    }
  }],
  'intervalMs': 1000,
  'times': 30,
  'maxPass': 1,
  'maxHistoryItems': 30,
})

# doing some other stuff which is supposed to trigger the popup for the next 30 seconds

history: Dict[str, Any] = driver.execute_script('mobile: unscheduleAction', {
  'name': 'myPopupHandlingAction',
})

def did_execution_pass(execution: List[Dict]) -> bool:
    return all((step['passed'] for step in execution))

assert any((did_execution_pass(execution) for exection in history['stepResults']))
```
