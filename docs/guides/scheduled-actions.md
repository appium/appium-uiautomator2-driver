---
title: Scheduled Actions
---

Sometimes it is necessary to verify a UI scenario where one has to assert a UI control has appeared
on the screen, and then perform a decision action on this control. An example of such control might
be a notification or any other popup that automatically disappears shortly after being shown.

## Problem

The WebDriver protocol uses HTTP REST API to communicate with clients, which means that in order to
assert the existence of any element or perform any action on it, it is first necessary to send an
HTTP request to the server and receive an answer from it. This is needed for each particular command
or assertion, e.g. click, find element, get text, etc.

The time an HTTP request needs to reach the server, plus its response to reach the client, is the
roundtrip time, and the length of it depends on many factors. For some complex setups, the roundtrip
duration may even be counted in seconds, which makes it impossible to quickly handle an UI element,
because it would already not exist/disappear by the time the next request reaches the server.

## Scheduled Actions Concept

The Scheduled Actions concept aims to address the above problem. The main idea is to run the action
code on the server side in an asynchronous manner, and only retrieve the detailed execution history
if needed.

`Action` is this context means emulating a gesture, taking a screenshot, or retrieving the XML page
source. Currently these are the only supported actions, but more may be added in the future.

The `scheduled` part means that the action is parsed and stored by the server for the further
asynchronous execution. The client does not have any control over this action, and can only
unschedule it later, or fetch its execution history. All actions are being scheduled on the main UI
thread, and are reset automatically upon a new session creation.

Scheduled actions are supported by the UiAutomator2 driver since version 2.26.0.

## Available APIs

The driver exposes the following execute methods for managing scheduled actions:

- [`mobile: scheduleAction`](../reference/execute-methods.md#mobile-scheduleaction) - adds a new
  action to the schedule
- [`mobile: getActionHistory`](../reference/execute-methods.md#mobile-getactionhistory) - retrieves
  the execution history for a specific action
- [`mobile: unscheduleAction`](../reference/execute-methods.md#mobile-unscheduleaction) -
  unschedules a specific action

## Usage Example

Assume the application under test shows a short-living popup with two buttons to either accept or
reject it, with the goal being to accept it.

At first, it is necessary to figure out how the popup looks like in the page source, in order to
build element locators. For that, it is possible to create an action that periodically retrieves
page source snapshots:

```python
# Python
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

In the example above, the scheduled action takes a snapshot of the UI hierarchy every second.
Later, it is possible to retrieve the value of `history`, and inspect each item for the presence of
the expected popup element.

After the Accept button locator has been identified, the action may be updated:

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
