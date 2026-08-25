const { importMasterProductsService } = require("../services/import.service");

const importMasterProducts = async (request, response, next) => {
  try {
    const data = await importMasterProductsService(
      request.auth.orgId,
      request.auth.memberId,
      request.file.buffer
    );

    response.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { importMasterProducts };
