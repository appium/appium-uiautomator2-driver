import type {IDoctorCheck} from '@appium/types';
import {doctor} from 'appium-android-driver';

export const androidHomeCheck: IDoctorCheck = doctor.androidHomeCheck;
export const javaHomeCheck: IDoctorCheck = doctor.javaHomeCheck;
export const javaHomeValueCheck: IDoctorCheck = doctor.javaHomeValueCheck;
export const androidSdkCheck: IDoctorCheck = doctor.androidSdkCheck;
