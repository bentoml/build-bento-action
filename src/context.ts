import * as core from '@actions/core';
import * as handlebars from 'handlebars';
import {Context} from '@docker/actions-toolkit/lib/context';

export interface Inputs {
  bentoFile: string;
  version: string;
  context: string;
}

export async function getInputs(): Promise<Inputs> {
  return {
    bentoFile: core.getInput('bentofile'),
    version: core.getInput('version'),
    context: core.getInput('context') || Context.gitContext()
  };
}

export async function getArgs(inputs: Inputs): Promise<Array<string>> {
  const context = handlebars.compile(inputs.context)({defaultContext: Context.gitContext()});
  return [...(await getBuildArgs(inputs)), context];
}

async function getBuildArgs(inputs: Inputs): Promise<Array<string>> {
  const args: Array<string> = ['build', '-o', 'tag'];
  if (inputs.bentoFile) {
    args.push('--bentofile', inputs.bentoFile);
  }
  if (inputs.version) {
    args.push('--version', inputs.version);
  }
  return args;
}
