import React, { useState } from "react";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from "@mui/material";
import { formatTime } from "../common/util/formatter";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import ReportsMenu from "./components/ReportsMenu";
import ReportFilter from "./components/ReportFilter";
import usePersistedState from "../common/util/usePersistedState";
import ColumnSelect from "./components/ColumnSelect";
import { useCatch } from "../reactHelper";
import useReportStyles from "./common/useReportStyles";
import TableShimmer from "../common/components/TableShimmer";
import { usePreference } from "../common/util/preferences";

const columnsArray = [
  ["captureTime", "statisticsCaptureTime"],
  ["activeUsers", "statisticsActiveUsers"],
  ["activeDevices", "statisticsActiveDevices"],
  ["requests", "statisticsRequests"],
  ["messagesReceived", "statisticsMessagesReceived"],
  ["messagesStored", "statisticsMessagesStored"],
  ["mailSent", "notificatorMail"],
  ["smsSent", "notificatorSms"],
  ["geocoderRequests", "statisticsGeocoder"],
  ["geolocationRequests", "statisticsGeolocation"],
];
const columnsMap = new Map(columnsArray);

const StatisticsPage = () => {
  const classes = useReportStyles();
  const t = useTranslation();

  const hours12 = usePreference("twelveHourFormat");

  const [columns, setColumns] = usePersistedState("statisticsColumns", [
    "captureTime",
    "activeUsers",
    "activeDevices",
    "messagesStored",
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCatch(async ({ from, to }) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ from, to });
      const response = await fetch(`/api/statistics?${query.toString()}`);
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  });

  return (
    <PageLayout
      menu={<ReportsMenu />}
      breadcrumbs={["reportTitle", "statisticsTitle"]}
    >
      <div className={classes.header}>
        <ReportFilter handleSubmit={handleSubmit} showOnly ignoreDevice>
          <ColumnSelect
            columns={columns}
            setColumns={setColumns}
            columnsArray={columnsArray}
          />
        </ReportFilter>
      </div>
      <Table
        sx={{
          borderCollapse: "collapse",
          border: "2px solid gray",
        }}
      >
        <TableHead>
          <TableRow>
            {columns.map((key) => (
              <TableCell
                sx={{
                  border: "2px solid gray",
                  background: "#d3d3d3",
                  color: "black",
                }}
                key={key}
              >
                {t(columnsMap.get(key))}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? (
            items.map((item) => (
              <TableRow key={item.id}>
                {columns.map((key) => (
                  <TableCell
                    sx={{
                      border: "2px solid gray",
                    }}
                    key={key}
                  >
                    {key === "captureTime"
                      ? formatTime(item[key], "date", hours12)
                      : item[key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableShimmer columns={columns.length} />
          )}
        </TableBody>
      </Table>
    </PageLayout>
  );
};

export default StatisticsPage;
