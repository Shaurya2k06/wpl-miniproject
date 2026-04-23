import style from "./Admin.module.scss";
import { connect } from "react-redux";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { adminApi } from "../../api/api";
import Preloader from "../common/preloader/Preloader";

const COLORS = ["#0088F1", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#b47ddb", "#999"];

const fmtMoney = (v) => `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const AdminBoard = ({ isAuth, role, email }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalSales: "0",
    totalOrders: 0,
    totalUnitsSold: 0,
    brandData: [],
    salesData: [],
    recentOrders: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await adminApi.stats();
        const s = statsRes.data;
        setData({
          totalSales: s.totalSales ?? "0",
          totalOrders: s.totalOrders ?? 0,
          totalUnitsSold: s.totalUnitsSold ?? 0,
          brandData: Array.isArray(s.brandData) ? s.brandData : [],
          salesData: Array.isArray(s.salesData) ? s.salesData : [],
          recentOrders: Array.isArray(s.recentOrders) ? s.recentOrders : [],
        });
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch admin data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!isAuth || role !== "owner") {
    return (
      <Navigate to="/login" replace state={{ from: { pathname: "/admin" } }} />
    );
  }

  if (loading) return <Preloader />;

  const pieHasData = data.brandData.some((d) => Number(d.value) > 0);
  const pieData = pieHasData
    ? data.brandData
    : [{ name: t("admin.chartNoData"), value: 1 }];

  return (
    <div className={style.adminContainer}>
      <div className={style.header}>
        <div>
          <h1>{t("admin.dashboard") || "Admin Dashboard"}</h1>
          <p className={style.userProfile}>
            {t("admin.welcome") || "Welcome back"}, {email}
          </p>
        </div>
      </div>

      <div className={style.statsGrid}>
        <div className={style.statCard}>
          <h3>{t("admin.totalSales") || "Total Sales"}</h3>
          <div className={style.value}>${data.totalSales}</div>
        </div>
        <div className={style.statCard}>
          <h3>{t("admin.orders") || "Orders"}</h3>
          <div className={style.value}>{Number(data.totalOrders)}</div>
        </div>
        <div className={style.statCard}>
          <h3>{t("admin.unitsSold") || "Units sold"}</h3>
          <div className={style.value}>{Number(data.totalUnitsSold)}</div>
        </div>
      </div>

      <div className={style.chartsSection}>
        <div className={style.chartCard}>
          <h3>{t("admin.revenueByMonth") || "Revenue by month"}</h3>
          <div className={style.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.06)" }}
                  formatter={(value) => fmtMoney(value)}
                />
                <Legend />
                <Bar dataKey="sales" name={t("admin.revenue")} fill="#000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={style.chartCard}>
          <h3>{t("admin.topProducts") || "Top products by revenue"}</h3>
          <div className={style.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}-${index}`}
                      fill={
                        pieHasData
                          ? COLORS[index % COLORS.length]
                          : "#cccccc"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    pieHasData
                      ? [fmtMoney(value), t("admin.revenue")]
                      : [t("admin.chartNoData"), ""]
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={style.recentActivity}>
        <h3>{t("admin.allRecentOrders") || "Recent orders (all customers)"}</h3>
        <div className={style.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>{t("admin.orderId") || "Order ID"}</th>
                <th>{t("admin.customer") || "Customer"}</th>
                <th>{t("admin.placedAt") || "Placed"}</th>
                <th>{t("admin.itemCount") || "Items"}</th>
                <th>{t("admin.total") || "Total"}</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.length > 0 ? (
                data.recentOrders.map((row) => (
                  <tr key={row.id}>
                    <td>#{String(row.id).slice(0, 8)}…</td>
                    <td>{row.customerEmail}</td>
                    <td>
                      {new Date(row.placedAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td>{row.itemCount}</td>
                    <td>${Number(row.orderTotal).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", opacity: 0.5 }}>
                    {t("admin.noOrdersYet") || "No orders yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  isAuth: state.auth.isAuth,
  role: state.auth.role,
  email: state.auth.email,
});

export default connect(mapStateToProps, {})(AdminBoard);
