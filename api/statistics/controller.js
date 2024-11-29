const { getBookingCountByStatus, getStatisticsByMonth  } = require("./service");

async function getBookingStatusStatistics(req, res) {
  try {
    const bookingCounts = await getBookingCountByStatus();

    const response = {
      COMPLETED_BOOKING_COUNT: { data: null, value: 0, specificValue: "0" },
      DOING_BOOKING_COUNT: { data: null, value: 0, specificValue: "0" },
      CANCEL_BOOKING_COUNT: { data: null, value: 0, specificValue: "0" },
    };

    if (Array.isArray(bookingCounts) && bookingCounts.length > 0) {
      bookingCounts.forEach(({ status, count }) => {
        if (status === "completed") {
          response.COMPLETED_BOOKING_COUNT.value = count;
          response.COMPLETED_BOOKING_COUNT.specificValue = String(count);
        } else if (status === "in_progress") {
          response.DOING_BOOKING_COUNT.value = count;
          response.DOING_BOOKING_COUNT.specificValue = String(count);
        } else if (status === "cancelled") {
          response.CANCEL_BOOKING_COUNT.value = count;
          response.CANCEL_BOOKING_COUNT.specificValue = String(count);
        }
      });
    } else {
      // Dữ liệu mặc định cho mục đích demo
      response.COMPLETED_BOOKING_COUNT = { data: "Demo data", value: 10, specificValue: "10" };
      response.DOING_BOOKING_COUNT = { data: "Demo data", value: 5, specificValue: "5" };
      response.CANCEL_BOOKING_COUNT = { data: "Demo data", value: 2, specificValue: "2" };
    }

    res.json({ data: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getMonthlyStatistics(req, res) {
  try {
    const { year } = req.params;
    const statistics = await getStatisticsByMonth(year);

    let data = [];
    if (Array.isArray(statistics) && statistics.length > 0) {
      data = statistics.map((stat) => ({
        BOOKING_COUNT: {
          fromDate: `${year}-${stat.month}-01`,
          toDate: `${year}-${stat.month}-31`,
          value: stat.booking_count,
          specificValue: String(stat.booking_count),
        },
        REVENUE: {
          fromDate: `${year}-${stat.month}-01`,
          toDate: `${year}-${stat.month}-31`,
          value: stat.revenue || 0,
          specificValue: String(stat.revenue || 0),
        },
        EXPERT: {
          fromDate: `${year}-${stat.month}-01`,
          toDate: `${year}-${stat.month}-31`,
          value: stat.expert_count,
          specificValue: String(stat.expert_count),
        },
      }));
    } else {
      data = [
        {
          "BOOKING_COUNT": {
            "fromDate": 1704092400000,
            "toDate": 1706720399000,
            "value": 1.0,
            "specificValue": "1"
          },
          "REVENUE": {
            "fromDate": 1704092400000,
            "toDate": 1706720399000,
            "value": 14.0,
            "specificValue": "14"
          },
          "EXPERT": {
            "fromDate": 1704092400000,
            "toDate": 1706720399000,
            "value": 0.0,
            "specificValue": "0"
          }
        },
        {
          "BOOKING_COUNT": {
            "fromDate": 1706770800000,
            "toDate": 1709225999000,
            "value": 1.0,
            "specificValue": "1"
          },
          "REVENUE": {
            "fromDate": 1706770800000,
            "toDate": 1709225999000,
            "value": 3.0,
            "specificValue": "3"
          },
          "EXPERT": {
            "fromDate": 1706770800000,
            "toDate": 1709225999000,
            "value": 0.0,
            "specificValue": "0"
          }
        },
        {
          "BOOKING_COUNT": {
            "fromDate": 1709276400000,
            "toDate": 1711904399000,
            "value": 9.0,
            "specificValue": "9"
          },
          "REVENUE": {
            "fromDate": 1709276400000,
            "toDate": 1711904399000,
            "value": 9.0,
            "specificValue": "9"
          },
          "EXPERT": {
            "fromDate": 1709276400000,
            "toDate": 1711904399000,
            "value": 0.0,
            "specificValue": "0"
          }
        },
        {
          "BOOKING_COUNT": {
            "fromDate": 1711954800000,
            "toDate": 1714496399000,
            "value": 2.0,
            "specificValue": "2"
          },
          "REVENUE": {
            "fromDate": 1711954800000,
            "toDate": 1714496399000,
            "value": 8.0,
            "specificValue": "8"
          },
          "EXPERT": {
            "fromDate": 1711954800000,
            "toDate": 1714496399000,
            "value": 3.0,
            "specificValue": "3"
          }
        },
        {
          "BOOKING_COUNT": {
            "fromDate": 1714546800000,
            "toDate": 1717174799000,
            "value": 2.0,
            "specificValue": "2"
          },
          "REVENUE": {
            "fromDate": 1714546800000,
            "toDate": 1717174799000,
            "value": 9.0,
            "specificValue": "9"
          },
          "EXPERT": {
            "fromDate": 1714546800000,
            "toDate": 1717174799000,
            "value": 0.0,
            "specificValue": "0"
          }
        },
        {
          "BOOKING_COUNT": {
            "fromDate": 1717225200000,
            "toDate": 1719766799000,
            "value": 13.0,
            "specificValue": "13"
          },
          "REVENUE": {
            "fromDate": 1717225200000,
            "toDate": 1719766799000,
            "value": 16.0,
            "specificValue": "16"
          },
          "EXPERT": {
            "fromDate": 1717225200000,
            "toDate": 1719766799000,
            "value": 4.0,
            "specificValue": "4"
          }
        },
        {
          "BOOKING_COUNT": {
            "fromDate": 1719817200000,
            "toDate": 1722445199000,
            "value": 4.0,
            "specificValue": "4"
          },
          "REVENUE": {
            "fromDate": 1719817200000,
            "toDate": 1722445199000,
            "value": 7.0,
            "specificValue": "7"
          },
          "EXPERT": {
            "fromDate": 1719817200000,
            "toDate": 1722445199000,
            "value": 2.0,
            "specificValue": "2"
          }
        },
        {
          "BOOKING_COUNT": {
            "fromDate": 1722495600000,
            "toDate": 1725123599000,
            "value": 14.0,
            "specificValue": "14"
          },
          "REVENUE": {
            "fromDate": 1722495600000,
            "toDate": 1725123599000,
            "value": 35.0,
            "specificValue": "35"
          },
          "EXPERT": {
            "fromDate": 1722495600000,
            "toDate": 1725123599000,
            "value": 35.0,
            "specificValue": "35"
          }
        },
        {
          "BOOKING_COUNT": {
            "fromDate": 1725174000000,
            "toDate": 1727715599000,
            "value": 17.0,
            "specificValue": "17"
          },
          "REVENUE": {
            "fromDate": 1725174000000,
            "toDate": 1727715599000,
            "value": 23.0,
            "specificValue": "23"
          },
          "EXPERT": {
            "fromDate": 1725174000000,
            "toDate": 1727715599000,
            "value": 18.0,
            "specificValue": "18"
          }
        },
        {
          "BOOKING_COUNT": {
            "fromDate": 1727766000000,
            "toDate": 1730393999000,
            "value": 12.0,
            "specificValue": "12"
          },
          "REVENUE": {
            "fromDate": 1727766000000,
            "toDate": 1730393999000,
            "value": 22.0,
            "specificValue": "22"
          },
          "EXPERT": {
            "fromDate": 1727766000000,
            "toDate": 1730393999000,
            "value": 11.0,
            "specificValue": "11"
          }
        },
        {
          "BOOKING_COUNT": {
            "fromDate": 1730444400000,
            "toDate": 1732985999000,
            "value": 3.0,
            "specificValue": "3"
          },
          "REVENUE": {
            "fromDate": 1730444400000,
            "toDate": 1732985999000,
            "value": 8.0,
            "specificValue": "8"
          },
          "EXPERT": {
            "fromDate": 1730444400000,
            "toDate": 1732985999000,
            "value": 7.0,
            "specificValue": "7"
          }
        },
        {
          "BOOKING_COUNT": {
            "fromDate": 1733036400000,
            "toDate": 1735664399000,
            "value": 0.0,
            "specificValue": "0"
          },
          "REVENUE": {
            "fromDate": 1733036400000,
            "toDate": 1735664399000,
            "value": 0.0,
            "specificValue": "0"
          },
          "EXPERT": {
            "fromDate": 1733036400000,
            "toDate": 1735664399000,
            "value": 0.0,
            "specificValue": "0"
          }
        }
      ];
    }

    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  getBookingStatusStatistics,
  getMonthlyStatistics
};
