#!/usr/bin/env node
import 'source-map-support/register';
import * as fs from 'fs'
import * as path from "path";
import * as yaml from 'js-yaml';
import * as cdk from 'aws-cdk-lib';
import { AppCdkStack } from '../lib/app-cdk-stack';
import { BuildConfig } from '../config/build-config';

const config = getConfig("dev");

const app = new cdk.App();

new AppCdkStack(app, 'AppCdkStack', { env: { account: config.awsAccountID, region: config.awsProfileRegion } }, config);

function getConfig(env: string): BuildConfig {
  return yaml.load(fs.readFileSync(path.resolve("./config/" + env + ".yaml"), "utf8")) as BuildConfig;
}