// Copyright (c) HashiCorp, Inc
// SPDX-License-Identifier: MPL-2.0
import { parse } from "..";

const schema = {
  resource_schemas: {},
  data_source_schemas: {},
  provider: {
    version: 0,
    block: {
      attributes: {
        access_key: {
          type: "string",
          description:
            "The access key for API operations. You can retrieve this\nfrom the 'Security & Credentials' section of the AWS console.",
          optional: true,
        },
        allowed_account_ids: {
          type: ["set", "string"],
          optional: true,
        },
        permanent_deletion_time_in_days: {
          type: "number",
          description_kind: "plain",
          optional: true,
        },
        internal: {
          type: "bool",
          description_kind: "plain",
          optional: true,
          computed: true,
        },
        annotations: {
          type: ["map", "string"],
          description:
            "An unstructured key value map stored with the service that may be used to store arbitrary metadata. More info: http://kubernetes.io/docs/user-guide/annotations",
          description_kind: "plain",
          optional: true,
        },
        manifest: {
          type: "dynamic",
          description:
            "A Kubernetes manifest describing the desired state of the resource in HCL format.",
          description_kind: "plain",
          required: true,
        },
      },
      block_types: {
        assume_role: {
          nesting_mode: "set",
          block: {
            attributes: {
              external_id: {
                type: "string",
                description:
                  "The external ID to use when assuming the role. If omitted, no external ID is passed to the AssumeRole call.",
                optional: true,
              },
            },
          },
          max_items: 1,
        },
        ignore_tags: {
          nesting_mode: "list",
          block: {
            attributes: {
              key_prefixes: {
                type: ["set", "string"],
                description:
                  "Resource tag key prefixes to ignore across all resources.",
                optional: true,
              },
              key_prefixes_number: {
                type: ["set", "number"],
                description:
                  "Resource tag key prefixes to ignore across all resources.",
                optional: true,
              },
              key_prefixes_bool: {
                type: ["set", "bool"],
                description:
                  "Resource tag key prefixes to ignore across all resources.",
                optional: true,
              },
            },
          },
        },
      },
    },
  },
} as any;

describe("new generator types", () => {
  it("should parse a simple schema", () => {
    expect(parse(schema)).toMatchInlineSnapshot(`
      Object {
        "provider": Object {
          "attributes": Object {
            "access_key": Object {
              "__type": "settable",
              "description": "The access key for API operations. You can retrieve this
      from the 'Security & Credentials' section of the AWS console.",
              "optionality": true,
              "type": "string",
            },
            "allowed_account_ids": Object {
              "__type": "settable",
              "description": undefined,
              "optionality": true,
              "type": Object {
                "__type": "list",
                "type": "string",
              },
            },
            "annotations": Object {
              "__type": "settable",
              "description": "An unstructured key value map stored with the service that may be used to store arbitrary metadata. More info: http://kubernetes.io/docs/user-guide/annotations",
              "optionality": true,
              "type": Object {
                "__type": "map",
                "valueType": "string",
              },
            },
            "assume_role": Object {
              "__type": "settable",
              "optionality": false,
              "type": Object {
                "__type": "list",
                "type": Object {
                  "__type": "object",
                  "attributes": Object {
                    "external_id": Object {
                      "__type": "settable",
                      "description": "The external ID to use when assuming the role. If omitted, no external ID is passed to the AssumeRole call.",
                      "optionality": true,
                      "type": "string",
                    },
                  },
                },
              },
            },
            "ignore_tags": Object {
              "__type": "settable",
              "optionality": false,
              "type": Object {
                "__type": "list",
                "type": Object {
                  "__type": "object",
                  "attributes": Object {
                    "key_prefixes": Object {
                      "__type": "settable",
                      "description": "Resource tag key prefixes to ignore across all resources.",
                      "optionality": true,
                      "type": Object {
                        "__type": "list",
                        "type": "string",
                      },
                    },
                    "key_prefixes_bool": Object {
                      "__type": "settable",
                      "description": "Resource tag key prefixes to ignore across all resources.",
                      "optionality": true,
                      "type": Object {
                        "__type": "list",
                        "type": "bool",
                      },
                    },
                    "key_prefixes_number": Object {
                      "__type": "settable",
                      "description": "Resource tag key prefixes to ignore across all resources.",
                      "optionality": true,
                      "type": Object {
                        "__type": "list",
                        "type": "number",
                      },
                    },
                  },
                },
              },
            },
            "internal": Object {
              "__type": "settable",
              "description": undefined,
              "optionality": true,
              "type": "bool",
            },
            "manifest": Object {
              "__type": "settable",
              "description": "A Kubernetes manifest describing the desired state of the resource in HCL format.",
              "optionality": false,
              "type": Object {
                "__type": "dynamic",
              },
            },
            "permanent_deletion_time_in_days": Object {
              "__type": "settable",
              "description": undefined,
              "optionality": true,
              "type": "number",
            },
          },
        },
      }
    `);
  });
});
