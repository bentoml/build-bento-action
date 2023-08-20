import * as fs from 'fs';
import * as stateHelper from './state-helper';
import * as core from '@actions/core';
import * as actionsToolkit from '@docker/actions-toolkit';
import {Context} from '@docker/actions-toolkit/lib/context';
import {ExecOutput} from '@actions/exec';
import {GitHub} from '@docker/actions-toolkit/lib/github';
import * as Helpers from './helpers';
import * as context from './context';

actionsToolkit.run(
  // main
  async () => {
    const inputs: context.Inputs = await context.getInputs();

    await core.group(`GitHub Actions runtime token ACs`, async () => {
      try {
        await GitHub.printActionsRuntimeTokenACs();
      } catch (e) {
        core.warning(e.message);
      }
    });

    if (!(await Helpers.isBentomlAvailable())) {
      core.setFailed(`BentoML is required. See https://github.com/bentoml/containerize-and-push-action for more information.`);
      return;
    }

    await core.group(`BentoML check`, async () => {
      try {
        await Helpers.getExecOutput('bentoml', ['list'], {silent: true}).then(res => {
          core.info(res.stdout.match(/(.*)\s*$/)?.[0]?.trim() ?? 'non available');
        });
        await Helpers.getExecOutput('bentoml', ['models', 'list'], {
          silent: true
        }).then(res => {
          core.info(res.stdout.match(/(.*)\s*$/)?.[0]?.trim() ?? 'non available');
        });
      } catch (e) {
        core.info(e.message);
      }
    });

    stateHelper.setTmpDir(Context.tmpDir());

    const args: string[] = await context.getArgs(inputs);
    const res: ExecOutput = await Helpers.getExecOutput('bentoml', args, {ignoreReturnCode: true});

    if (res.stderr.length > 0 && res.exitCode != 0) {
      throw new Error(`bentoml build failed with: ${res.stderr.match(/(.*)\s*$/)?.[0]?.trim() ?? 'unknown error'}`);
    }
    const generatedBento: string = res.stdout.match(/__tag__:(.*?):(.*?)/g)?.[0]?.trim() ?? '';
    if (generatedBento.length == 0) {
      throw new Error(`bentoml build failed with: Failed to parse generated BentoML tag (cannot find the correct __tag__ in stdout)`);
    }
    const [, bentoName, bentoVersion] = generatedBento;

    await core.group(`Bento name`, async () => {
      core.info(bentoName);
      core.setOutput('bento-name', bentoName);
    });
    await core.group(`Bento version`, async () => {
      core.info(bentoVersion);
      core.setOutput('bento-version', bentoVersion);
    });
    await core.group(`Metadata`, async () => {
      await Helpers.getExecOutput('bentoml', ['get', `${bentoName}:${bentoVersion}`, '-o', 'json'], {silent: true}).then(res => {
        const metadata = JSON.parse(res.stdout);
        core.info(metadata);
        core.setOutput('metadata', metadata);
      });
    });
  },
  // post
  async () => {
    if (stateHelper.tmpDir.length > 0) {
      await core.group(`Removing temp folder ${stateHelper.tmpDir}`, async () => {
        fs.rmSync(stateHelper.tmpDir, {recursive: true});
      });
    }
  }
);
