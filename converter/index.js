const gradient = require("./gradient");
const distinctClasses = require("./distinctClasses");

const converters = {
  class: distinctClasses,
  gradient: gradient
};

module.exports = converters;
