require("dotenv").config();

const { deterministicPartitionKey } = require("./dpk");
const { initDB } = require("./db/connect");
const {
  initFacility,
  initAgent,
  initShift,
  getShiftsByFacility,
  generateReport,
} = require("./ticketbreakdown");

console.log("Second Task Result = ", deterministicPartitionKey());

(async () => {
  await initDB();
  await initFacility();
  await initAgent();
  await initShift();
  let { AgentArray, CompanyName, Date } = await getShiftsByFacility(
    process.env.Facility,
    process.env.Quarter
  );
  generateReport(AgentArray, CompanyName, Date);
})();
