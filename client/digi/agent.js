function joinAgent(data) {
  const token = JWT.sign(
    {
      data,
    },
    "secret",
    { expiresIn: 60 * 60 }
  );
  if (token)
    window.location.href = `https://cc-digi.enablex.io/session?token=${token}`;
}
