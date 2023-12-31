/// <reference path="./index.d.ts" />
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  HfInference: () => HfInference,
  HfInferenceEndpoint: () => HfInferenceEndpoint,
  InferenceOutputError: () => InferenceOutputError,
  audioClassification: () => audioClassification,
  audioToAudio: () => audioToAudio,
  automaticSpeechRecognition: () => automaticSpeechRecognition,
  conversational: () => conversational,
  documentQuestionAnswering: () => documentQuestionAnswering,
  featureExtraction: () => featureExtraction,
  fillMask: () => fillMask,
  imageClassification: () => imageClassification,
  imageSegmentation: () => imageSegmentation,
  imageToImage: () => imageToImage,
  imageToText: () => imageToText,
  objectDetection: () => objectDetection,
  questionAnswering: () => questionAnswering,
  request: () => request,
  sentenceSimilarity: () => sentenceSimilarity,
  streamingRequest: () => streamingRequest,
  summarization: () => summarization,
  tableQuestionAnswering: () => tableQuestionAnswering,
  tabularClassification: () => tabularClassification,
  tabularRegression: () => tabularRegression,
  textClassification: () => textClassification,
  textGeneration: () => textGeneration,
  textGenerationStream: () => textGenerationStream,
  textToImage: () => textToImage,
  textToSpeech: () => textToSpeech,
  tokenClassification: () => tokenClassification,
  translation: () => translation,
  visualQuestionAnswering: () => visualQuestionAnswering,
  zeroShotClassification: () => zeroShotClassification,
  zeroShotImageClassification: () => zeroShotImageClassification
});
module.exports = __toCommonJS(src_exports);

// src/tasks/index.ts
var tasks_exports = {};
__export(tasks_exports, {
  audioClassification: () => audioClassification,
  audioToAudio: () => audioToAudio,
  automaticSpeechRecognition: () => automaticSpeechRecognition,
  conversational: () => conversational,
  documentQuestionAnswering: () => documentQuestionAnswering,
  featureExtraction: () => featureExtraction,
  fillMask: () => fillMask,
  imageClassification: () => imageClassification,
  imageSegmentation: () => imageSegmentation,
  imageToImage: () => imageToImage,
  imageToText: () => imageToText,
  objectDetection: () => objectDetection,
  questionAnswering: () => questionAnswering,
  request: () => request,
  sentenceSimilarity: () => sentenceSimilarity,
  streamingRequest: () => streamingRequest,
  summarization: () => summarization,
  tableQuestionAnswering: () => tableQuestionAnswering,
  tabularClassification: () => tabularClassification,
  tabularRegression: () => tabularRegression,
  textClassification: () => textClassification,
  textGeneration: () => textGeneration,
  textGenerationStream: () => textGenerationStream,
  textToImage: () => textToImage,
  textToSpeech: () => textToSpeech,
  tokenClassification: () => tokenClassification,
  translation: () => translation,
  visualQuestionAnswering: () => visualQuestionAnswering,
  zeroShotClassification: () => zeroShotClassification,
  zeroShotImageClassification: () => zeroShotImageClassification
});

// src/lib/isUrl.ts
function isUrl(modelOrUrl) {
  return /^http(s?):/.test(modelOrUrl) || modelOrUrl.startsWith("/");
}

// src/lib/makeRequestOptions.ts
var HF_INFERENCE_API_BASE_URL = "https://api-inference.huggingface.co";
function makeRequestOptions(args, options) {
  const { model, accessToken, ...otherArgs } = args;
  const { task, includeCredentials, ...otherOptions } = options ?? {};
  const headers = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  const binary = "data" in args && !!args.data;
  if (!binary) {
    headers["Content-Type"] = "application/json";
  } else {
    if (options?.wait_for_model) {
      headers["X-Wait-For-Model"] = "true";
    }
    if (options?.use_cache === false) {
      headers["X-Use-Cache"] = "false";
    }
    if (options?.dont_load_model) {
      headers["X-Load-Model"] = "0";
    }
  }
  const url = (() => {
    if (isUrl(model)) {
      return model;
    }
    if (task) {
      return `${HF_INFERENCE_API_BASE_URL}/pipeline/${task}/${model}`;
    }
    return `${HF_INFERENCE_API_BASE_URL}/models/${model}`;
  })();
  const info = {
    headers,
    method: "POST",
    body: binary ? args.data : JSON.stringify({
      ...otherArgs,
      options: options && otherOptions
    }),
    credentials: includeCredentials ? "include" : "same-origin"
  };
  return { url, info };
}

// src/tasks/custom/request.ts
async function request(args, options) {
  const { url, info } = makeRequestOptions(args, options);
  const response = await (options?.fetch ?? fetch)(url, info);
  if (options?.retry_on_error !== false && response.status === 503 && !options?.wait_for_model) {
    return request(args, {
      ...options,
      wait_for_model: true
    });
  }
  if (!response.ok) {
    if (response.headers.get("Content-Type")?.startsWith("application/json")) {
      const output = await response.json();
      if (output.error) {
        throw new Error(output.error);
      }
    }
    throw new Error("An error occurred while fetching the blob");
  }
  if (response.headers.get("Content-Type")?.startsWith("application/json")) {
    return await response.json();
  }
  return await response.blob();
}

// src/vendor/fetch-event-source/parse.ts
function getLines(onLine) {
  let buffer;
  let position;
  let fieldLength;
  let discardTrailingNewline = false;
  return function onChunk(arr) {
    if (buffer === void 0) {
      buffer = arr;
      position = 0;
      fieldLength = -1;
    } else {
      buffer = concat(buffer, arr);
    }
    const bufLength = buffer.length;
    let lineStart = 0;
    while (position < bufLength) {
      if (discardTrailingNewline) {
        if (buffer[position] === 10 /* NewLine */) {
          lineStart = ++position;
        }
        discardTrailingNewline = false;
      }
      let lineEnd = -1;
      for (; position < bufLength && lineEnd === -1; ++position) {
        switch (buffer[position]) {
          case 58 /* Colon */:
            if (fieldLength === -1) {
              fieldLength = position - lineStart;
            }
            break;
          case 13 /* CarriageReturn */:
            discardTrailingNewline = true;
          case 10 /* NewLine */:
            lineEnd = position;
            break;
        }
      }
      if (lineEnd === -1) {
        break;
      }
      onLine(buffer.subarray(lineStart, lineEnd), fieldLength);
      lineStart = position;
      fieldLength = -1;
    }
    if (lineStart === bufLength) {
      buffer = void 0;
    } else if (lineStart !== 0) {
      buffer = buffer.subarray(lineStart);
      position -= lineStart;
    }
  };
}
function getMessages(onId, onRetry, onMessage) {
  let message = newMessage();
  const decoder = new TextDecoder();
  return function onLine(line, fieldLength) {
    if (line.length === 0) {
      onMessage?.(message);
      message = newMessage();
    } else if (fieldLength > 0) {
      const field = decoder.decode(line.subarray(0, fieldLength));
      const valueOffset = fieldLength + (line[fieldLength + 1] === 32 /* Space */ ? 2 : 1);
      const value = decoder.decode(line.subarray(valueOffset));
      switch (field) {
        case "data":
          message.data = message.data ? message.data + "\n" + value : value;
          break;
        case "event":
          message.event = value;
          break;
        case "id":
          onId(message.id = value);
          break;
        case "retry":
          const retry = parseInt(value, 10);
          if (!isNaN(retry)) {
            onRetry(message.retry = retry);
          }
          break;
      }
    }
  };
}
function concat(a, b) {
  const res = new Uint8Array(a.length + b.length);
  res.set(a);
  res.set(b, a.length);
  return res;
}
function newMessage() {
  return {
    data: "",
    event: "",
    id: "",
    retry: void 0
  };
}

// src/tasks/custom/streamingRequest.ts
async function* streamingRequest(args, options) {
  const { url, info } = makeRequestOptions({ ...args, stream: true }, options);
  const response = await (options?.fetch ?? fetch)(url, info);
  if (options?.retry_on_error !== false && response.status === 503 && !options?.wait_for_model) {
    return streamingRequest(args, {
      ...options,
      wait_for_model: true
    });
  }
  if (!response.ok) {
    if (response.headers.get("Content-Type")?.startsWith("application/json")) {
      const output = await response.json();
      if (output.error) {
        throw new Error(output.error);
      }
    }
    throw new Error(`Server response contains error: ${response.status}`);
  }
  if (response.headers.get("content-type") !== "text/event-stream") {
    throw new Error(
      `Server does not support event stream content type, it returned ` + response.headers.get("content-type")
    );
  }
  if (!response.body) {
    return;
  }
  const reader = response.body.getReader();
  let events = [];
  const onEvent = (event) => {
    events.push(event);
  };
  const onChunk = getLines(
    getMessages(
      () => {
      },
      () => {
      },
      onEvent
    )
  );
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        return;
      onChunk(value);
      for (const event of events) {
        if (event.data.length > 0) {
          const data = JSON.parse(event.data);
          if (typeof data === "object" && data !== null && "error" in data) {
            throw new Error(data.error);
          }
          yield data;
        }
      }
      events = [];
    }
  } finally {
    reader.releaseLock();
  }
}

// src/lib/InferenceOutputError.ts
var InferenceOutputError = class extends TypeError {
  constructor(message) {
    super(
      `Invalid inference output: ${message}. Use the 'request' method with the same parameters to do a custom call with no type checking.`
    );
    this.name = "InferenceOutputError";
  }
};

// src/tasks/audio/audioClassification.ts
async function audioClassification(args, options) {
  const res = await request(args, options);
  const isValidOutput = Array.isArray(res) && res.every((x) => typeof x.label === "string" && typeof x.score === "number");
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected Array<{label: string, score: number}>");
  }
  return res;
}

// src/tasks/audio/automaticSpeechRecognition.ts
async function automaticSpeechRecognition(args, options) {
  const res = await request(args, options);
  const isValidOutput = typeof res?.text === "string";
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected {text: string}");
  }
  return res;
}

// src/tasks/audio/textToSpeech.ts
async function textToSpeech(args, options) {
  const res = await request(args, options);
  const isValidOutput = res && res instanceof Blob;
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected Blob");
  }
  return res;
}

// src/tasks/audio/audioToAudio.ts
async function audioToAudio(args, options) {
  const res = await request(args, options);
  const isValidOutput = Array.isArray(res) && res.every(
    (x) => typeof x.label === "string" && typeof x.blob === "string" && typeof x["content-type"] === "string"
  );
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected Array<{label: string, blob: string, content-type: string}>");
  }
  return res;
}

// src/tasks/cv/imageClassification.ts
async function imageClassification(args, options) {
  const res = await request(args, options);
  const isValidOutput = Array.isArray(res) && res.every((x) => typeof x.label === "string" && typeof x.score === "number");
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected Array<{label: string, score: number}>");
  }
  return res;
}

// src/tasks/cv/imageSegmentation.ts
async function imageSegmentation(args, options) {
  const res = await request(args, options);
  const isValidOutput = Array.isArray(res) && res.every((x) => typeof x.label === "string" && typeof x.mask === "string" && typeof x.score === "number");
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected Array<{label: string, mask: string, score: number}>");
  }
  return res;
}

// src/tasks/cv/imageToText.ts
async function imageToText(args, options) {
  const res = (await request(args, options))?.[0];
  if (typeof res?.generated_text !== "string") {
    throw new InferenceOutputError("Expected {generated_text: string}");
  }
  return res;
}

// src/tasks/cv/objectDetection.ts
async function objectDetection(args, options) {
  const res = await request(args, options);
  const isValidOutput = Array.isArray(res) && res.every(
    (x) => typeof x.label === "string" && typeof x.score === "number" && typeof x.box.xmin === "number" && typeof x.box.ymin === "number" && typeof x.box.xmax === "number" && typeof x.box.ymax === "number"
  );
  if (!isValidOutput) {
    throw new InferenceOutputError(
      "Expected Array<{label:string; score:number; box:{xmin:number; ymin:number; xmax:number; ymax:number}}>"
    );
  }
  return res;
}

// src/tasks/cv/textToImage.ts
async function textToImage(args, options) {
  const res = await request(args, options);
  const isValidOutput = res && res instanceof Blob;
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected Blob");
  }
  return res;
}

// ../shared/src/base64FromBytes.ts
function base64FromBytes(arr) {
  if (globalThis.Buffer) {
    return globalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin = [];
    arr.forEach((byte) => {
      bin.push(String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(""));
  }
}

// ../shared/src/isBackend.ts
var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
var isWebWorker = typeof self === "object" && self.constructor && self.constructor.name === "DedicatedWorkerGlobalScope";

// src/tasks/cv/imageToImage.ts
async function imageToImage(args, options) {
  let reqArgs;
  if (!args.parameters) {
    reqArgs = {
      accessToken: args.accessToken,
      model: args.model,
      data: args.inputs
    };
  } else {
    reqArgs = {
      ...args,
      inputs: base64FromBytes(
        new Uint8Array(args.inputs instanceof ArrayBuffer ? args.inputs : await args.inputs.arrayBuffer())
      )
    };
  }
  const res = await request(reqArgs, options);
  const isValidOutput = res && res instanceof Blob;
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected Blob");
  }
  return res;
}

// src/tasks/cv/zeroShotImageClassification.ts
async function zeroShotImageClassification(args, options) {
  const reqArgs = {
    ...args,
    inputs: {
      image: base64FromBytes(
        new Uint8Array(
          args.inputs.image instanceof ArrayBuffer ? args.inputs.image : await args.inputs.image.arrayBuffer()
        )
      )
    }
  };
  const res = await request(reqArgs, options);
  const isValidOutput = Array.isArray(res) && res.every((x) => typeof x.label === "string" && typeof x.score === "number");
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected Array<{label: string, score: number}>");
  }
  return res;
}

// src/tasks/nlp/conversational.ts
async function conversational(args, options) {
  const res = await request(args, options);
  return res;
}

// src/lib/getDefaultTask.ts
var taskCache = /* @__PURE__ */ new Map();
var CACHE_DURATION = 10 * 60 * 1e3;
var MAX_CACHE_ITEMS = 1e3;
var HF_HUB_URL = "https://huggingface.co";
async function getDefaultTask(model, accessToken) {
  if (isUrl(model)) {
    return null;
  }
  const key = `${model}:${accessToken}`;
  let cachedTask = taskCache.get(key);
  if (cachedTask && cachedTask.date < new Date(Date.now() - CACHE_DURATION)) {
    taskCache.delete(key);
    cachedTask = void 0;
  }
  if (cachedTask === void 0) {
    const modelTask = await fetch(`${HF_HUB_URL}/api/models/${model}?expand[]=pipeline_tag`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
    }).then((resp) => resp.json()).then((json) => json.pipeline_tag).catch(() => null);
    if (!modelTask) {
      return null;
    }
    cachedTask = { task: modelTask, date: /* @__PURE__ */ new Date() };
    taskCache.set(key, { task: modelTask, date: /* @__PURE__ */ new Date() });
    if (taskCache.size > MAX_CACHE_ITEMS) {
      taskCache.delete(taskCache.keys().next().value);
    }
  }
  return cachedTask.task;
}

// src/tasks/nlp/featureExtraction.ts
async function featureExtraction(args, options) {
  const defaultTask = await getDefaultTask(args.model, args.accessToken);
  const res = await request(
    args,
    defaultTask === "sentence-similarity" ? {
      ...options,
      task: "feature-extraction"
    } : options
  );
  let isValidOutput = true;
  const isNumArrayRec = (arr, maxDepth, curDepth = 0) => {
    if (curDepth > maxDepth)
      return false;
    if (arr.every((x) => Array.isArray(x))) {
      return arr.every((x) => isNumArrayRec(x, maxDepth, curDepth + 1));
    } else {
      return arr.every((x) => typeof x === "number");
    }
  };
  isValidOutput = Array.isArray(res) && isNumArrayRec(res, 3, 0);
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected Array<number[][][] | number[][] | number[] | number>");
  }
  return res;
}

// src/tasks/nlp/fillMask.ts
async function fillMask(args, options) {
  const res = await request(args, options);
  const isValidOutput = Array.isArray(res) && res.every(
    (x) => typeof x.score === "number" && typeof x.sequence === "string" && typeof x.token === "number" && typeof x.token_str === "string"
  );
  if (!isValidOutput) {
    throw new InferenceOutputError(
      "Expected Array<{score: number, sequence: string, token: number, token_str: string}>"
    );
  }
  return res;
}

// src/tasks/nlp/questionAnswering.ts
async function questionAnswering(args, options) {
  const res = await request(args, options);
  const isValidOutput = typeof res === "object" && !!res && typeof res.answer === "string" && typeof res.end === "number" && typeof res.score === "number" && typeof res.start === "number";
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected {answer: string, end: number, score: number, start: number}");
  }
  return res;
}

// src/tasks/nlp/sentenceSimilarity.ts
async function sentenceSimilarity(args, options) {
  const defaultTask = await getDefaultTask(args.model, args.accessToken);
  const res = await request(
    args,
    defaultTask === "feature-extraction" ? {
      ...options,
      task: "sentence-similarity"
    } : options
  );
  const isValidOutput = Array.isArray(res) && res.every((x) => typeof x === "number");
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected number[]");
  }
  return res;
}

// src/tasks/nlp/summarization.ts
async function summarization(args, options) {
  const res = await request(args, options);
  const isValidOutput = Array.isArray(res) && res.every((x) => typeof x?.summary_text === "string");
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected Array<{summary_text: string}>");
  }
  return res?.[0];
}

// src/tasks/nlp/tableQuestionAnswering.ts
async function tableQuestionAnswering(args, options) {
  const res = await request(args, options);
  const isValidOutput = typeof res?.aggregator === "string" && typeof res.answer === "string" && Array.isArray(res.cells) && res.cells.every((x) => typeof x === "string") && Array.isArray(res.coordinates) && res.coordinates.every((coord) => Array.isArray(coord) && coord.every((x) => typeof x === "number"));
  if (!isValidOutput) {
    throw new InferenceOutputError(
      "Expected {aggregator: string, answer: string, cells: string[], coordinates: number[][]}"
    );
  }
  return res;
}

// src/tasks/nlp/textClassification.ts
async function textClassification(args, options) {
  const res = (await request(args, options))?.[0];
  const isValidOutput = Array.isArray(res) && res.every((x) => typeof x?.label === "string" && typeof x.score === "number");
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected Array<{label: string, score: number}>");
  }
  return res;
}

// src/tasks/nlp/textGeneration.ts
async function textGeneration(args, options) {
  const res = await request(args, options);
  const isValidOutput = Array.isArray(res) && res.every((x) => typeof x?.generated_text === "string");
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected Array<{generated_text: string}>");
  }
  return res?.[0];
}

// src/tasks/nlp/textGenerationStream.ts
async function* textGenerationStream(args, options) {
  yield* streamingRequest(args, options);
}

// src/utils/toArray.ts
function toArray(obj) {
  if (Array.isArray(obj)) {
    return obj;
  }
  return [obj];
}

// src/tasks/nlp/tokenClassification.ts
async function tokenClassification(args, options) {
  const res = toArray(await request(args, options));
  const isValidOutput = Array.isArray(res) && res.every(
    (x) => typeof x.end === "number" && typeof x.entity_group === "string" && typeof x.score === "number" && typeof x.start === "number" && typeof x.word === "string"
  );
  if (!isValidOutput) {
    throw new InferenceOutputError(
      "Expected Array<{end: number, entity_group: string, score: number, start: number, word: string}>"
    );
  }
  return res;
}

// src/tasks/nlp/translation.ts
async function translation(args, options) {
  const res = await request(args, options);
  const isValidOutput = Array.isArray(res) && res.every((x) => typeof x?.translation_text === "string");
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected type Array<{translation_text: string}>");
  }
  return res?.[0];
}

// src/tasks/nlp/zeroShotClassification.ts
async function zeroShotClassification(args, options) {
  const res = toArray(
    await request(args, options)
  );
  const isValidOutput = Array.isArray(res) && res.every(
    (x) => Array.isArray(x.labels) && x.labels.every((_label) => typeof _label === "string") && Array.isArray(x.scores) && x.scores.every((_score) => typeof _score === "number") && typeof x.sequence === "string"
  );
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected Array<{labels: string[], scores: number[], sequence: string}>");
  }
  return res;
}

// src/tasks/multimodal/documentQuestionAnswering.ts
async function documentQuestionAnswering(args, options) {
  const reqArgs = {
    ...args,
    inputs: {
      question: args.inputs.question,
      // convert Blob or ArrayBuffer to base64
      image: base64FromBytes(
        new Uint8Array(
          args.inputs.image instanceof ArrayBuffer ? args.inputs.image : await args.inputs.image.arrayBuffer()
        )
      )
    }
  };
  const res = toArray(
    await request(reqArgs, options)
  )?.[0];
  const isValidOutput = typeof res?.answer === "string" && (typeof res.end === "number" || typeof res.end === "undefined") && (typeof res.score === "number" || typeof res.score === "undefined") && (typeof res.start === "number" || typeof res.start === "undefined");
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected Array<{answer: string, end?: number, score?: number, start?: number}>");
  }
  return res;
}

// src/tasks/multimodal/visualQuestionAnswering.ts
async function visualQuestionAnswering(args, options) {
  const reqArgs = {
    ...args,
    inputs: {
      question: args.inputs.question,
      // convert Blob or ArrayBuffer to base64
      image: base64FromBytes(
        new Uint8Array(
          args.inputs.image instanceof ArrayBuffer ? args.inputs.image : await args.inputs.image.arrayBuffer()
        )
      )
    }
  };
  const res = (await request(reqArgs, options))?.[0];
  const isValidOutput = typeof res?.answer === "string" && typeof res.score === "number";
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected Array<{answer: string, score: number}>");
  }
  return res;
}

// src/tasks/tabular/tabularRegression.ts
async function tabularRegression(args, options) {
  const res = await request(args, options);
  const isValidOutput = Array.isArray(res) && res.every((x) => typeof x === "number");
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected number[]");
  }
  return res;
}

// src/tasks/tabular/tabularClassification.ts
async function tabularClassification(args, options) {
  const res = await request(args, options);
  const isValidOutput = Array.isArray(res) && res.every((x) => typeof x === "number");
  if (!isValidOutput) {
    throw new InferenceOutputError("Expected number[]");
  }
  return res;
}

// src/HfInference.ts
var HfInference = class {
  accessToken;
  defaultOptions;
  constructor(accessToken = "", defaultOptions = {}) {
    this.accessToken = accessToken;
    this.defaultOptions = defaultOptions;
    for (const [name, fn] of Object.entries(tasks_exports)) {
      Object.defineProperty(this, name, {
        enumerable: false,
        value: (params, options) => (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fn({ ...params, accessToken }, { ...defaultOptions, ...options })
        )
      });
    }
  }
  /**
   * Returns copy of HfInference tied to a specified endpoint.
   */
  endpoint(endpointUrl) {
    return new HfInferenceEndpoint(endpointUrl, this.accessToken, this.defaultOptions);
  }
};
var HfInferenceEndpoint = class {
  constructor(endpointUrl, accessToken = "", defaultOptions = {}) {
    accessToken;
    defaultOptions;
    for (const [name, fn] of Object.entries(tasks_exports)) {
      Object.defineProperty(this, name, {
        enumerable: false,
        value: (params, options) => (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fn({ ...params, accessToken, model: endpointUrl }, { ...defaultOptions, ...options })
        )
      });
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HfInference,
  HfInferenceEndpoint,
  InferenceOutputError,
  audioClassification,
  audioToAudio,
  automaticSpeechRecognition,
  conversational,
  documentQuestionAnswering,
  featureExtraction,
  fillMask,
  imageClassification,
  imageSegmentation,
  imageToImage,
  imageToText,
  objectDetection,
  questionAnswering,
  request,
  sentenceSimilarity,
  streamingRequest,
  summarization,
  tableQuestionAnswering,
  tabularClassification,
  tabularRegression,
  textClassification,
  textGeneration,
  textGenerationStream,
  textToImage,
  textToSpeech,
  tokenClassification,
  translation,
  visualQuestionAnswering,
  zeroShotClassification,
  zeroShotImageClassification
});
