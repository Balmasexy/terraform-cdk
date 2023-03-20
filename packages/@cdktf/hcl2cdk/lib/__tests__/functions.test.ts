/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import * as t from "@babel/types";
import generate from "@babel/generator";
import { AttributeType } from "@cdktf/provider-generator";
import { coerceType } from "../coerceType";

type BaseThing = {
  type: string;
  children: Thing[];
  meta?: object;
  range?: unknown; // optional as we don't care about it
};

type FunctionCall = BaseThing & {
  type: "function";
  meta: {
    name: string;
    expandedFinalArgument?: boolean; // optional as we don't care about it
    closeParenRange?: unknown; // optional as we don't care about it
    openParenRange?: unknown; // optional as we don't care about it
    nameRange?: unknown; // optional as we don't care about it
  };
};

type TemplateWrap = BaseThing & {
  type: "TemplateWrap";
};

type Template = BaseThing & {
  type: "Template";
};

type LiteralValue = BaseThing & {
  type: "LiteralValue";
  meta: {
    type: "string";
  };
};

type ScopeTraversal = BaseThing & {
  type: "ScopeTraversal";
  meta: {
    traversal: {
      segment: string;
      range?: unknown; // optional as we don't care about it
    }[];
  };
};

type Thing =
  | FunctionCall
  | TemplateWrap
  | Template
  | ScopeTraversal
  | LiteralValue;

// '${replace(module.foo.output, "-", var.bar)}'
// from https://github.com/hashicorp/terraform-cdk/pull/2729
const dummy2: Thing = {
  children: [
    {
      children: [
        {
          children: [],
          meta: {
            traversal: [
              {
                range: {
                  End: {
                    Byte: 16,
                    Column: 16,
                    Line: 0,
                  },
                  Filename: "",
                  Start: {
                    Byte: 10,
                    Column: 10,
                    Line: 0,
                  },
                },
                segment: "module",
              },
              {
                range: {
                  End: {
                    Byte: 20,
                    Column: 20,
                    Line: 0,
                  },
                  Filename: "",
                  Start: {
                    Byte: 16,
                    Column: 16,
                    Line: 0,
                  },
                },
                segment: "foo",
              },
              {
                range: {
                  End: {
                    Byte: 27,
                    Column: 27,
                    Line: 0,
                  },
                  Filename: "",
                  Start: {
                    Byte: 20,
                    Column: 20,
                    Line: 0,
                  },
                },
                segment: "output",
              },
            ],
          },
          range: {
            end: {
              byte: 27,
              column: 27,
              line: 0,
            },
            start: {
              byte: 10,
              column: 10,
              line: 0,
            },
          },
          type: "ScopeTraversal",
        },
        {
          children: [
            {
              children: [],
              meta: {
                type: "string",
              },
              range: {
                end: {
                  byte: 31,
                  column: 31,
                  line: 0,
                },
                start: {
                  byte: 30,
                  column: 30,
                  line: 0,
                },
              },
              type: "LiteralValue",
            },
          ],
          range: {
            end: {
              byte: 31,
              column: 31,
              line: 0,
            },
            start: {
              byte: 30,
              column: 30,
              line: 0,
            },
          },
          type: "Template",
        },
        {
          children: [],
          meta: {
            traversal: [
              {
                range: {
                  End: {
                    Byte: 37,
                    Column: 37,
                    Line: 0,
                  },
                  Filename: "",
                  Start: {
                    Byte: 34,
                    Column: 34,
                    Line: 0,
                  },
                },
                segment: "var",
              },
              {
                range: {
                  End: {
                    Byte: 41,
                    Column: 41,
                    Line: 0,
                  },
                  Filename: "",
                  Start: {
                    Byte: 37,
                    Column: 37,
                    Line: 0,
                  },
                },
                segment: "bar",
              },
            ],
          },
          range: {
            end: {
              byte: 41,
              column: 41,
              line: 0,
            },
            start: {
              byte: 34,
              column: 34,
              line: 0,
            },
          },
          type: "ScopeTraversal",
        },
      ],
      meta: {
        closeParenRange: {
          end: {
            byte: 42,
            column: 42,
            line: 0,
          },
          start: {
            byte: 41,
            column: 41,
            line: 0,
          },
        },
        expandedFinalArgument: false,
        name: "replace",
        nameRange: {
          end: {
            byte: 9,
            column: 9,
            line: 0,
          },
          start: {
            byte: 2,
            column: 2,
            line: 0,
          },
        },
        openParenRange: {
          end: {
            byte: 10,
            column: 10,
            line: 0,
          },
          start: {
            byte: 9,
            column: 9,
            line: 0,
          },
        },
      },
      range: {
        end: {
          byte: 10,
          column: 10,
          line: 0,
        },
        start: {
          byte: 2,
          column: 2,
          line: 0,
        },
      },
      type: "function",
    },
  ],
  range: {
    end: {
      byte: 43,
      column: 43,
      line: 0,
    },
    start: {
      byte: 0,
      column: 0,
      line: 0,
    },
  },
  type: "TemplateWrap",
};

describe("bindings for Terraform functions", () => {
  it("should convert Terraform AST into TS AST", () => {
    expect(
      generate(terraformThingToTs(dummy2, "dynamic")).code
    ).toMatchInlineSnapshot(
      `"cdktf.Fn.replace(TodoReference-module-foo-output, \\"-\\", TodoReference-var-bar)"`
    );
  });

  it("should convert Terraform AST into TS AST for overriden function name", () => {
    expect(
      generate(
        terraformThingToTs(
          {
            type: "function",
            meta: {
              name: "length",
            },
            children: [
              {
                type: "ScopeTraversal",
                meta: {
                  traversal: [
                    {
                      segment: "var",
                    },
                    {
                      segment: "list",
                    },
                  ],
                },
                children: [],
              },
            ],
          },
          "number"
        )
      ).code
    ).toMatchInlineSnapshot(`"cdktf.Fn.lengthOf(TodoReference-var-list)"`);
  });

  it("should convert Terraform AST into TS AST for overriden function with variadic args for optional params", () => {
    expect(
      generate(
        terraformThingToTs(
          {
            type: "function",
            meta: {
              name: "bcrypt",
            },
            children: [
              {
                type: "ScopeTraversal",
                meta: {
                  traversal: [
                    {
                      segment: "var",
                    },
                    {
                      segment: "str",
                    },
                  ],
                },
                children: [],
              },
              {
                type: "ScopeTraversal",
                meta: {
                  traversal: [
                    {
                      segment: "var",
                    },
                    {
                      segment: "cost",
                    },
                  ],
                },
                children: [],
              },
            ],
          },
          "string"
        )
      ).code
    ).toMatchInlineSnapshot(
      `"cdktf.Fn.bcrypt(TodoReference-var-str, TodoReference-var-cost)"`
    );
  });

  it("should convert Terraform AST into TS AST for overriden function with variadic args for optional params that are not passed", () => {
    expect(
      generate(
        terraformThingToTs(
          {
            type: "function",
            meta: {
              name: "bcrypt",
            },
            children: [
              {
                type: "ScopeTraversal",
                meta: {
                  traversal: [
                    {
                      segment: "var",
                    },
                    {
                      segment: "str",
                    },
                  ],
                },
                children: [],
              },
            ],
          },
          "string"
        )
      ).code
    ).toMatchInlineSnapshot(`"cdktf.Fn.bcrypt(TodoReference-var-str)"`);
  });

  it("should convert Terraform AST into TS AST for function with variadic param", () => {
    expect(
      generate(
        terraformThingToTs(
          {
            type: "function",
            meta: {
              name: "try",
            },
            children: [
              {
                type: "ScopeTraversal",
                meta: {
                  traversal: [
                    {
                      segment: "var",
                    },
                    {
                      segment: "strA",
                    },
                  ],
                },
                children: [],
              },
              {
                type: "ScopeTraversal",
                meta: {
                  traversal: [
                    {
                      segment: "var",
                    },
                    {
                      segment: "strB",
                    },
                  ],
                },
                children: [],
              },
            ],
          },
          "dynamic"
        )
      ).code
    ).toMatchInlineSnapshot(
      `"cdktf.Fn.try([TodoReference-var-strA, TodoReference-var-strB])"`
    );
  });

  it("should convert Terraform AST into TS AST for join function with single list param", () => {
    expect(
      generate(
        terraformThingToTs(
          {
            type: "function",
            meta: {
              name: "join",
            },
            children: [
              {
                type: "ScopeTraversal",
                meta: {
                  traversal: [
                    {
                      segment: "var",
                    },
                    {
                      segment: "str",
                    },
                  ],
                },
                children: [],
              },
              {
                type: "ScopeTraversal",
                meta: {
                  traversal: [
                    {
                      segment: "var",
                    },
                    {
                      segment: "list",
                    },
                  ],
                },
                children: [],
              },
            ],
          },
          "string"
        )
      ).code
    ).toMatchInlineSnapshot(
      `"cdktf.Fn.join(TodoReference-var-str, TodoReference-var-list)"`
    );
  });

  it("should convert Terraform AST into TS AST for join function with multiple list params", () => {
    expect(
      generate(
        terraformThingToTs(
          {
            type: "function",
            meta: {
              name: "join",
            },
            children: [
              {
                type: "ScopeTraversal",
                meta: {
                  traversal: [
                    {
                      segment: "var",
                    },
                    {
                      segment: "str",
                    },
                  ],
                },
                children: [],
              },
              {
                type: "ScopeTraversal",
                meta: {
                  traversal: [
                    {
                      segment: "var",
                    },
                    {
                      segment: "listA",
                    },
                  ],
                },
                children: [],
              },
              {
                type: "ScopeTraversal",
                meta: {
                  traversal: [
                    {
                      segment: "var",
                    },
                    {
                      segment: "listB",
                    },
                  ],
                },
                children: [],
              },
            ],
          },
          "string"
        )
      ).code
    ).toMatchInlineSnapshot(
      `"cdktf.Fn.join(TodoReference-var-str, cdktf.Token.asList(cdktf.Fn.concat([TodoReference-var-listA, TodoReference-var-listB])))"`
    );
  });

  it("should throw if not enough parameters were passed", () => {
    expect(
      () =>
        generate(
          terraformThingToTs(
            {
              type: "function",
              meta: {
                name: "bcrypt",
              },
              children: [],
            },
            "string"
          )
        ).code
    ).toThrowErrorMatchingInlineSnapshot(
      `"Terraform function call to \\"bcrypt\\" is not valid! Parameter at index 0 of type string is not optional but received no value. The following parameters were passed: []"`
    );
  });

  // TODO: tests for type coercion
});

function terraformThingToTs(
  tfAst: Thing,
  targetType: AttributeType | undefined
): t.Expression {
  switch (tfAst.type) {
    case "function": {
      return terraformFunctionCallToTs(tfAst, targetType);
    }
    case "TemplateWrap": {
      // If there's just one child, we can skip them
      if (tfAst.children.length === 1) {
        return terraformThingToTs(tfAst.children[0], targetType);
      }
      throw new Error(
        "TemplateWrap with not exactly one child is not supported yet: " +
          tfAst.children
      );
    }
    case "ScopeTraversal": {
      return terraformScopeTraversalToTs(tfAst, targetType);
    }
    case "Template": {
      return terraformTemplateToTs(tfAst, targetType);
    }
    case "LiteralValue": {
      return terraformLiteralValueToTs(tfAst, targetType);
    }
    default:
      throw new Error("Unsupported type: " + (tfAst as any).type);
  }
}

function terraformScopeTraversalToTs(
  tfAst: ScopeTraversal,
  _targetType: AttributeType | undefined
): t.Expression {
  return t.identifier(
    "TodoReference-" + tfAst.meta.traversal.map((t) => t.segment).join("-")
  );
}

function terraformTemplateToTs(
  tfAst: Template,
  targetType: AttributeType | undefined
): t.Expression {
  if (tfAst.children.length === 1) {
    return terraformThingToTs(tfAst.children[0], targetType);
  }
  throw new Error("Template currently only supports exactly one child");
}

function terraformLiteralValueToTs(
  tfAst: LiteralValue,
  targetType: AttributeType | undefined
): t.Expression {
  const literalExpression = t.stringLiteral("-"); // FIXME: this is not yet part of the schema, but our test case uses "-", so we just hardcode it here
  return coerceType(
    // TODO: scope should be passed instead, even if coerceType won't need it probably
    {
      constructs: new Set(),
      hasTokenBasedTypeCoercion: false,
      providerGenerator: {},
      providerSchema: {},
      variables: {},
    },
    literalExpression,
    tfAst.meta.type,
    targetType
  );
}

function terraformFunctionCallToTs(
  tfAst: FunctionCall,
  targetType: AttributeType | undefined
): t.Expression {
  const { name } = tfAst.meta;

  const mapping = functionsMap[name];
  if (!mapping) {
    throw new Error(`Mapping not found for function: ${name}`);
  }

  if (mapping.transformer) {
    const newTfAst = mapping.transformer(tfAst);
    if (newTfAst !== tfAst)
      return terraformFunctionCallToTs(newTfAst, targetType);
  }

  const callee = t.memberExpression(
    t.memberExpression(t.identifier("cdktf"), t.identifier("Fn")),
    t.identifier(mapping.name)
  );

  const args: t.Expression[] = [];
  mapping.parameters.forEach((param, idx) => {
    if (param.variadic) {
      // return an array with all remaining children (each mapped accordingly)
      args.push(
        t.arrayExpression(
          tfAst.children
            .slice(idx)
            .map((child) => terraformThingToTs(child, param.type))
        )
      );
    } else {
      const child = tfAst.children[idx];
      if (child) {
        args.push(terraformThingToTs(child, param.type));
      } else if (!param.optional) {
        throw new Error(
          `Terraform function call to "${name}" is not valid! Parameter at index ${idx} of type ${
            param.type
          } is not optional but received no value. The following parameters were passed: ${JSON.stringify(
            tfAst.children
          )}`
        );
      }
    }
  });

  const returnType = mapping.returnType;

  const callExpression = t.callExpression(callee, args);

  return coerceType(
    // TODO: scope should be passed instead, even if coerceType won't need it probably
    {
      constructs: new Set(),
      hasTokenBasedTypeCoercion: false,
      providerGenerator: {},
      providerSchema: {},
      variables: {},
    },
    callExpression,
    returnType,
    targetType
  );
}

// TODO: this is going to be generated by the functions generation tooling and gets manual overrides for functions that we override
const functionsMap: Record<
  string,
  {
    name: string;
    returnType: AttributeType;
    parameters: {
      type: AttributeType;
      optional?: boolean;
      variadic?: boolean;
    }[];
    /**
     * Allows transforming the function call before it is handled. This is currently used to handle
     * different APIs between TF supporting join(sep, listA, listB) and CDKTF only supporting join(sep, list)
     * (as the alternative due to JSIIs lack of support for variadic parametes would be join(sep, lists) which
     *  would have a worse UX as most often just a single list is passed)
     * In the case of join() the transformer will convert the function call to join(sep, concat(listA, listB))
     * before handling it
     *
     * Caution: Beware of infinite recursion if the returned function call is to the same function that has this
     * transformer. Return the same instance of the passed functionCall to break out of that recursion.
     */
    transformer?: (functionCall: FunctionCall) => FunctionCall;
  }
> = {
  replace: {
    name: "replace",
    returnType: "string",
    parameters: [
      {
        type: "string",
      },
      {
        type: "string",
      },
      {
        type: "string",
      },
    ],
  },
  length: {
    name: "lengthOf",
    returnType: "number",
    parameters: [{ type: "dynamic" }],
  },
  bcrypt: {
    name: "bcrypt", // this one is not variadic anymore after we mapped it
    returnType: "string",
    parameters: [{ type: "string" }, { type: "number", optional: true }], // TODO: this will need to come from an override as the functions schema has a variadic type for this
  },
  join: {
    name: "join",
    returnType: "string",
    parameters: [{ type: "string" }, { type: ["list", "string"] }],
    /**
     * Terraform supports join(separator, listA, listB)
     * wheras CDKTF only supports join(separator, list) (to make it simpler to use as JSII does not support variadic parameters)
     * and we'd need to convert this to join(separator, concat(listA, listB)) if multiple variadic args are passed
     */
    transformer: (fc) => {
      if (fc.children.length <= 2) {
        return fc; // just one child -> nothing to do
      }
      return {
        type: "function",
        meta: {
          name: "join",
        },
        children: [
          fc.children[0], // the first parameter is the separator, so keep it as is
          {
            type: "function",
            meta: {
              name: "concat",
            },
            children: fc.children.slice(1), // all other children are the lists that are concatenated using concat()
          },
        ],
      };
    },
  },
  try: {
    name: "try",
    returnType: "dynamic",
    parameters: [{ type: "dynamic", variadic: true }],
  },
  concat: {
    name: "concat",
    returnType: "dynamic",
    parameters: [{ type: "dynamic", variadic: true }],
  },
};

/*
"replace": {
  "return_type": "string",
    "parameters": [
      { "name": "str", "type": "string" },
      { "name": "substr", "type": "string" },
      { "name": "replace", "type": "string" }
    ]
  },
*/
