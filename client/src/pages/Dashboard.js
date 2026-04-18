import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  getUsersWithPlans,
  deleteUser,
  getRegisteredUsersCount,
  getOnlineUsersCount,
  checkApiStatus,
  updateUserRole,
  checkDbStatus,
  getUptime,
  getDbPing,
} from "../services/userService";

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [registeredCount, setRegisteredCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [apiStatus, setApiStatus] = useState(null);
  const [apiStatusType, setApiStatusType] = useState("");
  const [dbStatus, setDbStatus] = useState(null);
  const [dbStatusType, setDbStatusType] = useState("");
  const [responseTime, setResponseTime] = useState(null);
  const [responseTimeType, setResponseTimeType] = useState("");
  const [roleUpdateTarget, setRoleUpdateTarget] = useState(null);
  const [roleUpdateStatus, setRoleUpdateStatus] = useState(null);
  const [roleUpdating, setRoleUpdating] = useState(false);
  const socketRef = useRef(null);

  const cardsPerPage = 3;

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const username = storedUser.name || "Admin";

  const loadUsers = useCallback(async () => {
    try {
      const res = await getUsersWithPlans();
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const loadCounts = useCallback(async () => {
    try {
      const res = await getRegisteredUsersCount();
      setRegisteredCount(res.data.total || 0);
    } catch (error) {
      console.log(error);
    }

    try {
      const res = await getOnlineUsersCount();
      setOnlineCount(res.data.online || 0);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadCounts();
  }, [loadUsers, loadCounts]);

  useEffect(() => {
    socketRef.current = io(
      process.env.REACT_APP_API_URL || "http://localhost:8080"
    );

    if (storedUser?.id) {
      socketRef.current.emit("user-online", storedUser.id);
    }

    socketRef.current.on("online-users-count", (count) => {
      setOnlineCount(count);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [storedUser?.id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleCheckApiStatus = async () => {
    setApiStatus("Checking API status...");
    setApiStatusType("info");

    try {
      await checkApiStatus();
      setApiStatus("API is working: connection successful.");
      setApiStatusType("success");
    } catch (error) {
      console.error(error);
      setApiStatus("API is not working: unable to connect.");
      setApiStatusType("danger");
    }
  };

  const handleCheckDbStatus = async () => {
    setDbStatus("Checking database status...");
    setDbStatusType("info");

    try {
      const res = await checkDbStatus();
      setDbStatus(res.data.status);
      setDbStatusType("success");
    } catch (error) {
      console.error(error);
      setDbStatus("Database is not working: connection failed.");
      setDbStatusType("danger");
    }
  };

  const handleTestResponseTime = async () => {
    setResponseTime("Testing response time...");
    setResponseTimeType("info");

    const startTime = Date.now();

    try {
      await checkApiStatus();
      const apiResponseTime = Date.now() - startTime;

      const uptimeRes = await getUptime();
      const uptime = uptimeRes.data.uptime;

      const dbPingRes = await getDbPing();
      const dbPingTime = dbPingRes.data.dbPingTime;

      setResponseTime(
        `1) Response Time: ${apiResponseTime} ms\n2) Uptime: ${uptime} seconds\n3) DB Ping Time: ${dbPingTime} ms`
      );
      setResponseTimeType("success");
    } catch (error) {
      const apiResponseTime = Date.now() - startTime;
      setResponseTime(
        `Response failed after ${apiResponseTime} ms. Could not fetch uptime or DB ping.`
      );
      setResponseTimeType("danger");
    }
  };

  const handleShowRoleOptions = (userId) => {
    setRoleUpdateStatus(null);
    setRoleUpdateTarget(roleUpdateTarget === userId ? null : userId);
  };

  const handleUpdateUserRole = async (userId) => {
    setRoleUpdating(true);
    setRoleUpdateStatus("Updating role...");

    try {
      await updateUserRole(userId, "admin");
      setRoleUpdateStatus("User has been promoted to Admin.");
      setRoleUpdateTarget(null);
      loadUsers();
    } catch (error) {
      console.error(error);
      setRoleUpdateStatus("Failed to update user role.");
    } finally {
      setRoleUpdating(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user account?")) {
      try {
        await deleteUser(userId);
        loadUsers();
      } catch (error) {
        alert(
          "Failed to delete user: " +
            (error.response?.data?.message || "Something went wrong")
        );
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const displayedUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="container py-5">
      <div className="dashboard-welcome-card p-4 mb-4">
        <h2 className="mb-2">Welcome, {username}</h2>
        <p className="mb-1">Admin Access Features</p>
      </div>

      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-white mb-3 admin-dashboard-title">
          Admin Dashboard
        </h1>
        <p className="lead text-muted">
          Manage users, monitor system status, and control access
        </p>
      </div>

      <div className="dashboard-panel-card p-4 mb-4">
        <div className="dashboard-panel-card-header mb-4">
          <div>
            <h4 className="text-white mb-1">System Overview</h4>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="dashboard-stat-card p-4 h-100 text-center">
              <h6 className="text-uppercase text-muted mb-3">
                Registered Users
              </h6>
              <p className="display-5 mb-2">{registeredCount}</p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="dashboard-stat-card p-4 h-100 text-center">
              <h6 className="text-uppercase text-muted mb-3">
                Current Online Users
              </h6>
              <p className="display-5 mb-2">{onlineCount}</p>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-4 d-flex justify-content-center">
            <button
              type="button"
              className="btn btn-primary rounded-pill px-4 py-3"
              onClick={handleCheckApiStatus}
            >
              Check API Status
            </button>
          </div>

          <div className="col-md-4 d-flex justify-content-center">
            <button
              type="button"
              className="btn btn-primary rounded-pill px-4 py-3"
              onClick={handleTestResponseTime}
            >
              System Health
            </button>
          </div>

          <div className="col-md-4 d-flex justify-content-center">
            <button
              type="button"
              className="btn btn-primary rounded-pill px-4 py-3"
              onClick={handleCheckDbStatus}
            >
              Check Database Status
            </button>
          </div>
        </div>
      </div>

      {apiStatus && (
        <div
          className={`alert alert-${apiStatusType} rounded-4 py-3 mb-4`}
          role="alert"
        >
          {apiStatus}
        </div>
      )}

      {dbStatus && (
        <div
          className={`alert alert-${dbStatusType} rounded-4 py-3 mb-4`}
          role="alert"
        >
          {dbStatus}
        </div>
      )}

      {responseTime && (
        <div
          className={`alert alert-${responseTimeType} rounded-4 py-3 mb-4`}
          role="alert"
        >
          {responseTime}
        </div>
      )}

      <div
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "24px",
          padding: "40px",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
          minHeight: "600px",
        }}
      >
        <div className="text-center mb-4">
          <h3 className="text-white fw-bold">Users List</h3>
        </div>

        <div className="d-flex justify-content-center mb-4">
          <input
            type="text"
            className="dashboard-search-input"
            placeholder="Search for users by username or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="row g-4">
          {displayedUsers.map((user) => (
            <div className="col-md-6 col-lg-4" key={user.id}>
              <div className="card shadow border-0 rounded-4 p-4 h-100">
                <h5 className="mb-3">{user.name}</h5>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Role:</strong> {user.role}
                </p>

                {user.workoutPlan && user.workoutPlan.length > 0 && (
                  <div className="mb-2">
                    <strong>Workout Goal:</strong> {user.workoutGoal || "N/A"}
                    <br />
                    <strong>Workout Level:</strong> {user.workoutLevel || "N/A"}
                    <br />
                    <strong>Workout Plan:</strong>
                    <ul className="mt-1">
                      {user.workoutPlan.map((item, index) => (
                        <li key={index} className="small">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {user.progress && user.progress.length > 0 && (
                  <div className="mb-3">
                    <strong>Progress:</strong>
                    <ul className="mt-1">
                      {user.progress.map((item, index) => (
                        <li key={index} className="small">
                          {item.day_name} - {item.weight} kg
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(user.id)}
                >
                  Remove Account
                </button>

                <button
                  className="btn btn-outline-light btn-sm ms-2"
                  onClick={() => handleShowRoleOptions(user.id)}
                >
                  Update User Role
                </button>

                {roleUpdateTarget === user.id && (
                  <div className="mt-3 p-3 bg-white bg-opacity-10 rounded-4">
                    <p className="mb-2 text-muted small">Select new role:</p>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleUpdateUserRole(user.id)}
                      disabled={roleUpdating}
                    >
                      {roleUpdating ? "Updating..." : "Admin"}
                    </button>

                    {roleUpdateStatus && (
                      <div
                        className={`alert alert-${
                          roleUpdateStatus.includes("Failed")
                            ? "danger"
                            : "success"
                        } rounded-4 mt-3 py-2 mb-0`}
                        role="alert"
                      >
                        {roleUpdateStatus}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length > cardsPerPage && (
          <div className="d-flex justify-content-between mt-4">
            <button
              className="btn btn-outline-light"
              onClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <button
              className="btn btn-outline-light"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={endIndex >= filteredUsers.length}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;