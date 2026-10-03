// Workaround to let Recommendation Service Unit Test find the correct module from Prisma internal
// to run the test.

module.exports = (request, options) => {
  try {
    return options.defaultResolver(request, options);
  } catch (error) {
    if (!request.endsWith('.js')) {
      throw error;
    }

    return options.defaultResolver(`${request.slice(0, -3)}.ts`, options);
  }
};
