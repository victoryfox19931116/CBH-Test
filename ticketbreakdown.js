const PDFGenerator = require("pdfkit");
const fs = require("fs");

const facilityModel = require("./model/facility");
const agentModel = require("./model/agent");
const shiftModel = require("./model/shift");
const { randomIntFromInterval } = require("./common");

const employeeNames = ["Christian", "Brian", "Daniel", "Andrew"];

exports.initFacility = async () => {
  const facility = await facilityModel.find();
  const facilityNames = [
    "Apple",
    "MicroSoft",
    "Twitter",
    "Youtube",
    "Linkedin",
  ];

  if (facility.length === 0) {
    for (const facilityName of facilityNames) {
      let newFacility = new facilityModel({ Name: facilityName });
      newFacility.save();
    }
    console.log("Facility Added");
  } else console.log("Facility Already existed");

  return true;
};

exports.initAgent = async () => {
  const agent = await agentModel.find();
  const agentNames = ["upwork", "freelancer", "fiverr", "guru"];

  if (agent.length === 0) {
    for (const agentName of agentNames) {
      let newAgent = new agentModel({
        Name: agentName,
        Employee: employeeNames,
      });
      newAgent.save();
    }
    console.log("Agent Added");
  } else console.log("Agent Already existed");

  return true;
};

exports.initShift = async () => {
  const facility = await facilityModel.find();
  const agent = await agentModel.find();
  const shift = await shiftModel.find();
  if (shift.length === 0) {
    for (let i = 0; i < 100; i++) {
      let timeFrom = randomIntFromInterval(
        new Date("2022-1-1").getTime(),
        new Date("2022-12-31").getTime()
      );

      let randFacilityID =
        facility[randomIntFromInterval(0, facility.length - 1)]._id.toString();
      let randAgentID =
        agent[randomIntFromInterval(0, agent.length - 1)]._id.toString();

      let newShift = new shiftModel({
        TimeFrom: timeFrom,
        TimeTo: timeFrom + 3600 * 1000 * Math.floor(Math.random() * 10),
        FacilityID: randFacilityID,
        AgnetID: randAgentID,
        EmployeeName: employeeNames[randomIntFromInterval(0, 3)],
      });

      newShift.save();
    }
    console.log("Shift Added");
  } else console.log("Shift Already existed");
  return true;
};

exports.getShiftsByFacility = async (facilityID, quarter) => {
  let agentArrayByGroup = [];
  const quarters = [
    [1, 3],
    [4, 6],
    [7, 9],
    [10, 12],
  ];
  const lastDay = new Date(
    quarter.split("-")[0],
    quarters[quarter.split("-")[1] - 1][1],
    0
  );
  const filterTimeFrom = new Date(
    `${quarter.split("-")[0]}-${quarters[quarter.split("-")[1] - 1][0]}-1`
  ).getTime();
  const filterTimeTo = new Date(
    `${quarter.split("-")[0]}-${
      quarters[quarter.split("-")[1] - 1][1]
    }-${lastDay.getDate()}`
  ).getTime();

  const facility = await facilityModel.find();
  const agent = await agentModel.find();
  const agentArrayTime = new Array(agent.length);
  const agentArrayByEmployee = new Array(agent.length);
  for (let i = 0; i < agent.length; i++) {
    agentArrayByEmployee[i] = new Array();
    agentArrayTime[i] = new Array();
  }

  let filterValues = await shiftModel
    .aggregate([
      {
        $match: {
          FacilityID: facility[facilityID - 1]._id.toString(),
          TimeFrom: { $gt: filterTimeFrom },
          TimeTo: { $lt: filterTimeTo },
        },
      },
    ])
    .exec();

  for (let i = 0; i < agent.length; i++) {
    agentArrayByGroup[i] = filterValues.filter(
      (user) => user.AgnetID === agent[i]._id.toString()
    );
  }

  for (let i = 0; i < agent.length; i++) {
    for (let j = 0; j < agent[i].Employee.length; j++) {
      agentArrayByEmployee[i][j] = agentArrayByGroup[i].filter(
        (user) => user.EmployeeName === agent[i].Employee[j]
      );
    }
  }

  for (let i = 0; i < agent.length; i++) {
    for (let j = 0; j < agent[i].Employee.length; j++) {
      agentArrayTime[i][j] = 0;
      for (let k = 0; k < agentArrayByEmployee[i][j].length; k++) {
        let endTime =
          agentArrayByEmployee[i][j][k].TimeTo > filterTimeTo
            ? filterTimeTo
            : agentArrayByEmployee[i][j][k].TimeTo;
        agentArrayTime[i][j] +=
          (endTime - agentArrayByEmployee[i][j][k].TimeFrom) / (1000 * 3600);
      }
    }
  }

  return {
    AgentArray: agentArrayTime,
    CompanyName: facility[facilityID - 1].Name,
    Date:
      `From ${quarter.split("-")[0]}-${
        quarters[quarter.split("-")[1] - 1][0]
      }-1` +
      " to " +
      `${quarter.split("-")[0]}-${
        quarters[quarter.split("-")[1] - 1][1]
      }-${lastDay.getDate()}`,
  };
};

exports.generateReport = async (agentArrayTime, companyName, date) => {
  let positionY = 60;
  const doc = new PDFGenerator();
  const agent = await agentModel.find();
  doc.pipe(fs.createWriteStream("Report.pdf"));
  doc.fontSize(27).text(`${companyName + " Report"}`, 60, 50);
  doc.fontSize(18).text(`(${date})`, 260, 56);
  for (let i = 0; i < agent.length; i++) {
    positionY += 30;
    doc
      .fontSize(20)
      .text(
        agent[i].Name +
          " " +
          agentArrayTime[i].reduce((a, b) => a + b, 0) +
          " hrs",
        80,
        positionY
      );
    for (let j = 0; j < agent[i].Employee.length; j++) {
      positionY += 25;
      doc
        .fontSize(17)
        .text(
          agent[i].Employee[j] + " : " + agentArrayTime[i][j] + " hrs",
          100,
          positionY
        );
    }
  }
  doc.end();
  console.log("Report Generated!");
};
