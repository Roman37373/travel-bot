
export async function messageCreateItem(chatId, text) {
  return {
    _id: 123,
    chatId,
    created: Date.now(),
    text,
  };
}

export async function messageUpdateItem(_id, answer) {
  // return {
  //   stamp: Date.now(),
  //   answer,
  // };
}

export async function messageGetList(chatId) {
  return [];
}