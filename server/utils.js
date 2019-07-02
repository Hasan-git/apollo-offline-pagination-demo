const GenerateObjectId = function () {
  var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
  return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
    return (Math.random() * 16 | 0).toString(16);
  }).toLowerCase();
}

const guid = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const paginator = function (items, page, limit) {

  var page = page || 1,
    limit = limit || 10,
    offset = (page - 1) * limit,

    paginatedItems = items.slice(offset).slice(0, limit),
    total_pages = Math.ceil(items.length / limit);
  return {
    page: page,
    per_page: limit,
    pre_page: page - 1 ? page - 1 : null,
    next_page: (total_pages > page) ? page + 1 : null,
    total: items.length,
    total_pages: total_pages,
    data: paginatedItems
  };
}

module.exports = { GenerateObjectId, guid, paginator }
