const checkExceprtionMessage = (error) => {
  const msg = error.message;
  return msg.includes('VM Exception') || msg.includes('invalid opcode') || msg.includes('invalid JUMP');
};

const assertException = (error) =>
  assert(checkExceprtionMessage(error), error.message);

module.exports = {
  assertException
};
