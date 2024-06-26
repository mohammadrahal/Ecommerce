import { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

const Users = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // To store the current logged-in user info

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser(); // Fetch the current logged-in user's information
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_URL}/user/getAll`);
      setUsers(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_URL}/user/current`);
      setCurrentUser(res.data.data); // Assuming the current user's info is in res.data.data
    } catch (error) {
      console.log(error);
    }
  };

  const handleSwitchToAdmin = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_URL}/user/switchAdmin/${id}`);
      setUsers(users.map(user =>
        user._id === id ? { ...user, isAdmin: !user.isAdmin } : user
      ));
      toast.success("User switched to admin successfully");
    } catch (error) {
      console.error("There was an error switching to admin!", error);
      toast.error("Failed to switch user to admin");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_URL}/user/delete/${id}`);
      setUsers(users.filter((user) => user._id !== id));
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("There was an error deleting the user!", error);
    }
  };

  return (
    <>
      <h1>Users</h1>
      <ToastContainer />
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Address</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.phoneNumber}</td>
              <td>{user.address}</td>
              <td>{user.role}</td>
              <td className='d-flex align-items-center gap-3'>
                {!user.isAdmin && (
                  <Button
                    variant="warning"
                    onClick={() => handleSwitchToAdmin(user._id)}
                    className="mr-2"
                  >
                    <FontAwesomeIcon icon={faUserShield} />{' '}
                    Make Admin
                  </Button>
                )}
                <Button variant="danger" onClick={() => handleDelete(user._id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default Users;

