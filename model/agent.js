const mongoose = require("mongoose");

const AgentSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Employee: [String],
});

const Agent = mongoose.model("Agent", AgentSchema);

module.exports = Agent;
