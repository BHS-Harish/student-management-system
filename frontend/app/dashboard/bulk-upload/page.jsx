"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { bulkUploadStudents } from "@/services/service";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../../components/ui/table";
import Papa from "papaparse";


export default function BulkUploadPage() {

    const REQUIRED_COLUMNS = ["name", "email", "age"];

    function validateRow(row) {
        const errors = {};
        if (!row.name || typeof row.name !== "string" || row.name.trim().length === 0) {
            errors.name = "Name is required.";
        }
        if (!row.email || typeof row.email !== "string" || !/^\S+@\S+\.\S+$/.test(row.email)) {
            errors.email = "Valid email required.";
        }
        if (!row.age || isNaN(Number(row.age)) || Number(row.age) < 1) {
            errors.age = "Age must be a positive number.";
        }
        return errors;
    }

    const router = useRouter();
    const [csvFile, setCsvFile] = useState(null);
    const [correctRows, setCorrectRows] = useState([]);
    const [incorrectRows, setIncorrectRows] = useState([]);
    const [columnsValid, setColumnsValid] = useState(true);
    const [saving, setSaving] = useState(false);

    const handleFileChange = e => {
        setCsvFile(e.target.files[0]);
    };

    const handleParse = () => {
        if (!csvFile) return;
        Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const { data, meta } = results;
                const columns = meta.fields;
                const hasAllColumns = REQUIRED_COLUMNS.every(col => columns.includes(col));
                setColumnsValid(hasAllColumns);
                if (!hasAllColumns) {
                    setCorrectRows([]);
                    setIncorrectRows([]);
                    return;
                }
                // Check for duplicate emails in the uploaded data
                const emailCount = {};
                data.forEach(row => {
                    const email = row.email?.toLowerCase();
                    if (email) {
                        emailCount[email] = (emailCount[email] || 0) + 1;
                    }
                });
                const correct = [];
                const incorrect = [];
                data.forEach((row, idx) => {
                    const errors = validateRow(row);
                    const email = row.email?.toLowerCase();
                    if (email && emailCount[email] > 1) {
                        errors.email = (errors.email ? errors.email + " " : "") + "Duplicate email in file.";
                    }
                    if (Object.keys(errors).length === 0) {
                        correct.push(row);
                    } else {
                        incorrect.push({ ...row, errors });
                    }
                });
                setCorrectRows(correct);
                setIncorrectRows(incorrect);
            }
        });
    };

    const handleIncorrectEdit = (idx, field, value) => {
        setIncorrectRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
    };

    const handleValidateRow = idx => {
        setIncorrectRows(rows => {
            const updatedRows = rows.map((row, i) => {
                if (i !== idx) return row;
                const updated = { ...row };
                updated.errors = validateRow(updated);
                return updated;
            });
            // Recalculate duplicate emails in all incorrect rows
            const emailCount = {};
            updatedRows.forEach(row => {
                const email = row.email?.toLowerCase();
                if (email) {
                    emailCount[email] = (emailCount[email] || 0) + 1;
                }
            });
            // Move rows without errors to correctRows
            const stillIncorrect = [];
            updatedRows.forEach(row => {
                const email = row.email?.toLowerCase();
                if (email && emailCount[email] > 1) {
                    row.errors.email = (row.errors.email ? row.errors.email + " " : "") + "Duplicate email in file.";
                } else if (row.errors.email) {
                    // Remove duplicate error if no longer duplicate
                    row.errors.email = row.errors.email.replace(/Duplicate email in file\.?/g, "").trim();
                    if (row.errors.email === "") delete row.errors.email;
                }
                if (Object.keys(row.errors).length === 0) {
                    // Only add if not already present in correctRows
                    setCorrectRows(prev => {
                        const alreadyExists = prev.some(r =>
                            REQUIRED_COLUMNS.every(col => r[col] === row[col])
                        );
                        return alreadyExists ? prev : [...prev, row];
                    });
                } else {
                    stillIncorrect.push(row);
                }
            });
            return stillIncorrect;
        });
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Bulk Upload Students (CSV)</h1>
                <Button variant="outline" onClick={() => router.push("/dashboard")}>Back</Button>
            </div>
            <div className="mb-4 flex gap-2 items-center">
                <Input type="file" accept=".csv" onChange={handleFileChange} />
                <Button onClick={handleParse} disabled={!csvFile}>Upload & Validate</Button>
            </div>
            {!columnsValid && (
                <div className="text-red-500 mb-4">CSV must contain columns: {REQUIRED_COLUMNS.join(", ")}</div>
            )}
            {correctRows.length > 0 && (
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold">Correct Data</h2>
                        <Button onClick={async () => {
                            setSaving(true);
                            try {
                                const result = await bulkUploadStudents(correctRows);
                                if (result && result.results) {
                                    result.results.forEach(res => {
                                        if (res.error) {
                                            toast.error(`Error uploading ${res.email}: ${res.error}`);
                                        }
                                    }
                                    );                                    
                                } else {
                                    toast.error(result.error || "Bulk upload failed.");
                                }
                                if(result.results && result.results.every(res => res.student&& !res.error)) {
                                    toast.success("Bulk upload completed.");
                                    setCorrectRows([]);
                                }
                            } catch (err) {
                                toast.error("Bulk upload failed.");
                            }
                            setSaving(false);
                        }} disabled={saving}>
                            {saving ? "Saving..." : "Save All"}
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {REQUIRED_COLUMNS.map(col => <TableHead key={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {correctRows.map((row, idx) => (
                                <TableRow key={idx}>
                                    {REQUIRED_COLUMNS.map(col => <TableCell key={col}>{row[col]}</TableCell>)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
            {incorrectRows.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-2">Incorrect Data (Editable)</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {REQUIRED_COLUMNS.map(col => <TableHead key={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</TableHead>)}
                                <TableHead>Errors</TableHead>
                                <TableHead>Validate</TableHead>
                                <TableHead>Delete</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {incorrectRows.map((row, idx) => (
                                <TableRow key={idx}>
                                    {REQUIRED_COLUMNS.map(col => (
                                        <TableCell key={col}>
                                            <Input
                                                value={row[col] || ""}
                                                onChange={e => handleIncorrectEdit(idx, col, e.target.value)}
                                                className={row.errors && row.errors[col] ? "border-red-500" : ""}
                                            />
                                        </TableCell>
                                    ))}
                                    <TableCell>
                                        <ul className="text-red-500 text-xs">
                                            {row.errors && Object.values(row.errors).map((err, i) => <li key={i}>{err}</li>)}
                                        </ul>
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" onClick={() => handleValidateRow(idx)}>Validate</Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="destructive" onClick={() => {
                                            setIncorrectRows(rows => rows.filter((_, i) => i !== idx));
                                        }}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}