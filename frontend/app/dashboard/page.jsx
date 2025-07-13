
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "../../components/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../../components/ui/alert-dialog";
import { Input } from "../../components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/table";
import { getStudentsByTeacherDepartment,registerStudent,logoutTeacher,deleteStudent } from "@/services/service";
import { toast } from 'sonner';

const Page = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentAge, setStudentAge] = useState("");
  const [studentError, setStudentError] = useState("");
  const [studentLoading, setStudentLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const handleLogout = async () => {
    const result = await logoutTeacher();
    if (result.success) {
      toast.success("Logged out successfully.");
      router.push('/');
    } else {
      toast.error(result.error || "Logout failed.");
    }
  };
  
  const handleAddOrEditStudent = async (e) => {
    e.preventDefault();
    setStudentError("");
    if (!studentName.trim()) {
      setStudentError("Name is required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(studentEmail)) {
      setStudentError("Please enter a valid email.");
      return;
    }
    if (!studentAge || isNaN(studentAge) || Number(studentAge) < 1) {
      setStudentError("Age must be a positive number.");
      return;
    }

    setStudentLoading(true);
    if (editMode && editStudentId) {
      // Edit student
      const { editStudent } = await import("@/services/service");
      const result = await editStudent(editStudentId, {
        name: studentName,
        email: studentEmail,
        age: Number(studentAge),
      });
      if (result.success) {
        setShowModal(false);
        setStudentName("");
        setStudentEmail("");
        setStudentAge("");
        setStudentError("");
        setEditMode(false);
        setEditStudentId(null);
        toast.success("Student updated successfully!");
        // Update students list
        setStudents(prev => prev.map(s => s._id === editStudentId ? result.student : s));
      } else {
        setStudentError(result.error || "Failed to update student.");
        toast.error(result.error || "Failed to update student.");
      }
    } else {
      // Add student
      const result = await registerStudent({
        name: studentName,
        email: studentEmail,
        age: Number(studentAge),
      });
      if (result.success) {
        setShowModal(false);
        setStudentName("");
        setStudentEmail("");
        setStudentAge("");
        setStudentError("");
        toast.success("Student added successfully!");
        // Refresh students list
        setStudents(prev => [...prev, result.student]);
      } else {
        setStudentError(result.error || "Failed to add student.");
        toast.error(result.error || "Failed to add student.");
      }
    }
    setStudentLoading(false);
  };

  useEffect(() => {
    if (!showModal) {
      setEditMode(false);
      setEditStudentId(null);
    }
    if( showModal && !editMode) {
      setStudentName("");
      setStudentEmail("");
      setStudentAge("");
      setStudentError("");
      setStudentLoading(false);
    }
  },[showModal])

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      setError("");
      try {
        const result = await getStudentsByTeacherDepartment();
        if (result.success) {
          setStudents(result.students);
        } else {
          setError(result.error || "Failed to fetch students.");
        }
      } catch (err) {
        setError("Network error");
      }
      setLoading(false);
    }
    fetchStudents();
  }, []);

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Students in Your Department</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </header>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-4">
        <Input
          type="text"
          placeholder="Search by name, email, or department..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <div className='flex gap-2' >
          <Button variant="secondary" onClick={() => router.push("/dashboard/bulk-upload")}>Bulk Upload</Button>
          <Button className="mb-4 md:mb-0" onClick={() => setShowModal(true)}>Add Student</Button>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/[.5] flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editMode ? "Edit Student" : "Add Student"}</h2>
            <form onSubmit={handleAddOrEditStudent}>
              <Input type="text" placeholder="Name" className="mb-2" value={studentName} onChange={e => setStudentName(e.target.value)} />
              <Input type="email" placeholder="Email" className="mb-2" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} />
              <Input type="number" placeholder="Age" className="mb-2" value={studentAge} onChange={e => setStudentAge(e.target.value)} />              
              {studentError && (
                <Alert variant="destructive" className="mb-2">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{studentError}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={studentLoading}>{studentLoading ? (editMode ? "Saving..." : "Adding...") : (editMode ? "Save Changes" : "Add Student")}</Button>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students
              .filter(student => {
                const term = searchTerm.trim().toLowerCase();
                if (!term) return true;
                return (
                  student.name.toLowerCase().includes(term) ||
                  student.email.toLowerCase().includes(term) ||
                  (student.department && student.department.toLowerCase().includes(term))
                );
              })
              .map(student => (
              <TableRow key={student._id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.age}</TableCell>
                <TableCell>{student.department}</TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditMode(true);
                    setEditStudentId(student._id);
                    setStudentName(student.name);
                    setStudentEmail(student.email);
                    setStudentAge(student.age.toString());
                    setShowModal(true);
                  }}>Edit</Button>
                  <AlertDialog open={deleteDialogOpen && studentToDelete?._id === student._id} onOpenChange={open => {
                    if (!open) {
                      setDeleteDialogOpen(false);
                      setStudentToDelete(null);
                    }
                  }}>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" onClick={() => {
                        setDeleteDialogOpen(true);
                        setStudentToDelete(student);
                      }}>Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Student</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {student.name}?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button size="sm" variant="destructive" onClick={async () => {
                            const result = await deleteStudent(student._id);
                            if (result.success) {
                              toast.success("Student deleted successfully!");
                              setStudents(prev => prev.filter(s => s._id !== student._id));
                            } else {
                              toast.error(result.error || "Failed to delete student.");
                            }
                            setDeleteDialogOpen(false);
                            setStudentToDelete(null);
                          }}>Delete</Button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default Page;
