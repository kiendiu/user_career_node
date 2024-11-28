const { getBookingCountByStatus, getStatisticsByMonth, getTotalCompletedBookingStatisticsService  } = require("./service");

async function getTotalCompletedBookingStatistics(req, res) {
    try {
      const statistics = await getTotalCompletedBookingStatisticsService();
  
      const response = {
        TOTAL_COMPLETED_BOOKINGS: {
          data: null,
          value: statistics.total_completed_bookings || 0,
          specificValue: String(statistics.total_completed_bookings || 0),
        },
        TOTAL_REVENUE: {
          data: null,
          value: statistics.total_revenue || 0,
          specificValue: String(statistics.total_revenue || 0),
        },
      };
  
      res.json({ data: response });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async function getBookingStatusStatistics(req, res) {
    try {
      const bookingCounts = await getBookingCountByStatus();
  
      const response = {
        COMPLETED_BOOKING_COUNT: { data: null, value: 0, specificValue: "0" },
        DOING_BOOKING_COUNT: { data: null, value: 0, specificValue: "0" },
        CANCEL_BOOKING_COUNT: { data: null, value: 0, specificValue: "0" },
      };
  
      if (bookingCounts.length > 0) {
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

    const data = statistics.map((stat) => ({
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

    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  getBookingStatusStatistics,
  getMonthlyStatistics,
  getTotalCompletedBookingStatistics
};
