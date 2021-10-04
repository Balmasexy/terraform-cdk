---
layout: "docs"
page_title: "CLI Configuration"
sidebar_current: "cdktf"
description: "Learn to install and configure the CDKTF Command Line Interface."
---

# CLI Configuration

## Telemetry

CDK for Terraform CLI ([cdktf-cli](../../packages/cdktf-cli)) interacts with a HashiCorp service called [Checkpoint](https://checkpoint.hashicorp.com)
to report project metrics such as cdktf version, project language, provider name, platform name, and other details that help guide the project maintainers with
feature and roadmap decisions. The code that interacts with Checkpoint is part of CDK for Terraform CLI and can be read [here](../../packages/cdktf-cli/lib/checkpoint.ts).

All HashiCorp projects including Terraform that is used by CDK for Terraform use Checkpoint.
Read more about project metrics [here](https://github.com/hashicorp/terraform-cdk/issues/325).

The information that is sent to Checkpoint is anonymous and cannot be used to identify the user or host. The use of Checkpoint is completely optional
and it can be disabled at any time by setting the `CHECKPOINT_DISABLE` environment variable to a non-empty value.

## Install

```bash
$ npm install -g cdktf-cli
```

## Use

```bash
$ cdktf --help
```

Help output:

```
Commands:
  cdktf convert [OPTIONS]          Converts a single file of HCL configuration to Terraform CDK. Takes the file to be converted on stdin.
  cdktf deploy [stack] [OPTIONS]   Deploy the given stack                                                                                                                                                   [aliases: apply]
  cdktf destroy [stack] [OPTIONS]  Destroy the given stack
  cdktf diff [stack] [OPTIONS]     Perform a diff (terraform plan) for the given stack                                                                                                                       [aliases: plan]
  cdktf get [OPTIONS]              Generate CDK Constructs for Terraform providers and modules.
  cdktf init [OPTIONS]             Create a new cdktf project from a template.
  cdktf list [OPTIONS]             List stacks in app.
  cdktf login                      Retrieves an API token to connect to Terraform Cloud.
  cdktf synth [stack] [OPTIONS]    Synthesizes Terraform code for the given app in a directory.                                                                                                        [aliases: synthesize]
  cdktf completion                 generate completion script

Options:
  --version                   Show version number                                                                                                                                                                  [boolean]
  --disable-logging           Dont write log files. Supported using the env CDKTF_DISABLE_LOGGING.                                                                                                 [boolean] [default: true]
  --disable-plugin-cache-env  Dont set TF_PLUGIN_CACHE_DIR automatically. This is useful when the plugin cache is configured differently. Supported using the env CDKTF_DISABLE_PLUGIN_CACHE_ENV. [boolean] [default: false]
  --log-level                 Which log level should be written. Only supported via setting the env CDKTF_LOG_LEVEL                                                                                                 [string]
  -h, --help                  Show help                                                                                                                                                                            [boolean]

Options can be specified via environment variables with the "CDKTF_" prefix (e.g. "CDKTF_OUTPUT")
```

### CI environment

If running in automated environments, the dynamic CLI output rendering can be forced to be static with the `CI` environment variable set to a true value.

## Configuration

You can configure the behavior of the Terraform CDK CLI by adding a `cdktf.json` file in your project root directory.

TODO: Add link to cdktf.json page
