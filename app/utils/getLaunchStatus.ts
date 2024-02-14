import { Launch } from "../services/launchesService";

const getLaunchStatus = (launch: Launch) => {
  if (launch.result === null) launch.result = -1;
  const statuses = {
    "-1": {
      name: launch.launched ? "Unknown" : "Waiting for launch",
      color: "blue-500",
    },
    "0": { name: "Failure", color: "red-500" },
    "1": { name: "Success", color: "green-600" },
    "2": { name: "Partial failure", color: "orange-500" },
    "3": { name: "In-Flight Abort (Crewed)", color: "yellow-500" },
  };
  return statuses[launch.result];
};

export default getLaunchStatus;
