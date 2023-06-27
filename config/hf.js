const { HfInference } = require("@huggingface/inference");
const hf = new HfInference(process.env.HF_API_KEY);

module.exports = {
  async huggingfaceAPI({ a, b, c }) {
    let x = await hf.conversational({
      model: "facebook/blenderbot-400M-distill",
      inputs: {
        past_user_inputs: a ? [a] : [],
        generated_responses: b? [b] : [],
        text: c,
      },
    });
    return x;
  },
};
