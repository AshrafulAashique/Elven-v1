const app = require('./api/index.js');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌟 ELVEN SERVER RUNNING (LOCAL DEV MODE)`);
  console.log(`🌐 Storefront: http://localhost:${PORT}/index.html`);
  console.log(`🔒 Admin Panel: http://localhost:${PORT}/shop-admin.html`);
  console.log(`======================================================\n`);
});
