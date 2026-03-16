function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(422).json({
        error: 'Dados inválidos',
        detalhes: error.details.map((d) => d.message)
      });
    }
    next();
  };
}

module.exports = validate;
