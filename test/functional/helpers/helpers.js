import { exec } from 'teen_process';

async function isArmEmu () {
  const archCmd = ['adb', 'shell getprop ro.product.cpu.abi'.split(' ')];
  const serialCmd = ['adb', ['get-serialno']];
  const {stdout: arch} = await exec(...archCmd);
  const {stdout: serial} = await exec(...serialCmd);
  if (arch.indexOf('arm') !== -1 && serial.indexOf('emulator') === 0) {
    return true;
  }
}

export { isArmEmu };
