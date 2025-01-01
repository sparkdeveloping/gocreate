"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  CircularProgress,
  TextField,
} from "@mui/material";
import { db, collection, getDocs } from "@/lib/firebase/firebaseConfig";
import Link from "next/link";

export default function MembershipsTable() {
  const [memberships, setMemberships] = useState([]);
  const [filteredMemberships, setFilteredMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch memberships from Firestore
  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const membershipsCollection = collection(db, "memberships");
      const membershipsSnapshot = await getDocs(membershipsCollection);
      const membershipsData = membershipsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMemberships(membershipsData);
      setFilteredMemberships(membershipsData);
    } catch (err) {
      setError(`Failed to load memberships: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle search query
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query) {
      const filtered = memberships.filter((membership) => {
        const { email, primaryContact } = membership;
        const firstName = primaryContact?.firstName?.toLowerCase() || "";
        const lastName = primaryContact?.lastName?.toLowerCase() || "";
        return (
          email.toLowerCase().includes(query) ||
          firstName.includes(query) ||
          lastName.includes(query)
        );
      });
      setFilteredMemberships(filtered);
    } else {
      setFilteredMemberships(memberships);
    }
  };

  // Handle pagination changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <CircularProgress />
        </div>
      ) : error ? (
        <div className="p-4 text-red-500">{error}</div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="p-4">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by Email, First Name, or Last Name"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Membership Type</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMemberships
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((membership) => (
                    <TableRow key={membership.id}>
                      <TableCell>{membership.id}</TableCell>
                      <TableCell>{membership.email}</TableCell>
                      <TableCell>
                        {membership.primaryContact?.firstName || "N/A"}
                      </TableCell>
                      <TableCell>
                        {membership.primaryContact?.lastName || "N/A"}
                      </TableCell>
                      <TableCell>
                        {membership.membershipType || "N/A"}
                      </TableCell>
                      <TableCell>{membership.status || "Pending"}</TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/memberships/${membership.id}`}
                          className="text-blue-500 hover:underline"
                        >
                          View Details
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredMemberships.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Paper>
  );
}
