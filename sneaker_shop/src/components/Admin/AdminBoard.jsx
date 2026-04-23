import style from "./Admin.module.scss";
import { connect } from "react-redux";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useEffect, useState } from "react";
import { sneakersApi, adminApi } from "../../api/api";
import Preloader from "../common/preloader/Preloader";

const COLORS = ['#0088F1', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminBoard = ({ isAuth, role, email }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalSneakers: 0,
    brandData: [],
    salesData: [],
    recentOrders: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sneakersRes, statsRes] = await Promise.all([
          sneakersApi.getAllSneakers(),
          adminApi.stats(),
        ]);

        const sneakers = sneakersRes.data;
        const s = statsRes.data;

        setData({
          totalSales: s.totalSales,
          totalOrders: s.totalOrders,
          totalSneakers: s.totalSneakers || sneakers.length,
          brandData: s.brandData?.length ? s.brandData : (() => {
            const brands = {};
            sneakers.forEach((item) => {
              brands[item.brand] = (brands[item.brand] || 0) + 1;
            });
            return Object.keys(brands).map((key) => ({ name: key, value: brands[key] }));
          })(),
          salesData: s.salesData,
          recentOrders: s.recentOrders || [],
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

  return (
    <div className={style.adminContainer}>
      <div className={style.header}>
        <div>
          <h1>{t("admin.dashboard") || "Admin Dashboard"}</h1>
          <p className={style.userProfile}>{t("admin.welcome") || "Welcome back"}, {email}</p>
        </div>
      </div>

      <div className={style.statsGrid}>
        <div className={style.statCard}>
          <h3>{t("admin.totalSales") || "Total Sales"}</h3>
          <div className={style.value}>${data.totalSales}</div>
        </div>
        <div className={style.statCard}>
          <h3>{t("admin.orders") || "Orders"}</h3>
          <div className={style.value}>{data.totalOrders}</div>
        </div>
        <div className={style.statCard}>
          <h3>{t("admin.inventory") || "Inventory"}</h3>
          <div className={style.value}>{data.totalSneakers}</div>
        </div>
      </div>

      <div className={style.chartsSection}>
        <div className={style.chartCard}>
          <h3>{t("admin.salesPerformance") || "Sales Performance (6 Months)"}</h3>
          <div className={style.chartBox}>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.1)'}} />
                  <Legend />
                  <Bar dataKey="sales" fill="#000" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className={style.chartCard}>
          <h3>{t("admin.brandDistribution") || "Brand Distribution"}</h3>
          <div className={style.chartBox}>
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.brandData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.brandData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={style.recentActivity}>
        <h3>{t("admin.recentOrders") || "Recent Orders"}</h3>
        <table>
          <thead>
            <tr>
              <th>{t("admin.orderId") || "Order ID"}</th>
              <th>{t("admin.product") || "Product"}</th>
              <th>{t("admin.quantity") || "Qty"}</th>
              <th>{t("admin.total") || "Total"}</th>
            </tr>
          </thead>
          <tbody>
            {data.recentOrders.length > 0 ? (
              data.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{String(order.id).slice(0, 8)}</td>
                  <td>{order.name}</td>
                  <td>{order.quantity}</td>
                  <td>${(order.price * order.quantity).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{textAlign: 'center', opacity: 0.5}}>No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  isAuth: state.auth.isAuth,
  role: state.auth.role,
  email: state.auth.email
});

export default connect(mapStateToProps, {})(AdminBoard);
