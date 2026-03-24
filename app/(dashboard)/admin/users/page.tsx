"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  assignedDistrict?: string;
  assignedTalukas?: string[];
  isActive: boolean;
  createdAt: string;
}

interface LocationData {
  divisions: string[];
  districts: string[];
  talukas: string[];
}

// Mock data for districts and talukas
const MOCK_DISTRICTS = [
  "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bidar", 
  "Buldhana", "Chhatrapati Sambhajinagar", "Dharashiv", "Dhule", 
  "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", 
  "Kolhapur", "Latur", "Mumbai", "Nagpur", "Nanded", "Nandurbar", 
  "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", 
  "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", 
  "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
];

const MOCK_TALUKAS: Record<string, string[]> = {
  "Pune": ["Pune City", "Pune Rural", "Haveli", "Khed", "Mulshi", "Maval", "Bhor", "Velhe"],
  "Mumbai": ["Mumbai City", "Mumbai Suburban", "Thane"],
  "Nagpur": ["Nagpur City", "Nagpur Rural", "Umred", "Ramtek"],
  "Nashik": ["Nashik City", "Nashik Rural", "Malegaon", "Sinnar", "Dindori"],
};

function AdminUsersContent() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [locations, setLocations] = useState<LocationData>({ 
    divisions: ["Pune", "Mumbai", "Nagpur", "Nashik", "Aurangabad", "Kolhapur"], 
    districts: MOCK_DISTRICTS, 
    talukas: [] 
  });
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "DISTRICT_HEAD",
    assignedTalukas: [] as string[],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchLocations();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/auth/invite");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch("/api/auth/locations");
      const data = await res.json();
      // Only update if we get valid data with districts
      if (data && data.districts && data.districts.length > 0) {
        setLocations({
          divisions: data.divisions || [],
          districts: data.districts,
          talukas: []
        });
      }
      // Otherwise, keep using the mock data from initial state
    } catch (err) {
      console.error("Failed to fetch locations", err);
    }
  };

  const fetchTalukas = async (district: string) => {
    try {
      const res = await fetch(`/api/auth/locations?district=${encodeURIComponent(district)}`);
      const data = await res.json();
      setLocations((prev) => ({ ...prev, talukas: data.talukas || [] }));
    } catch (err) {
      console.error("Failed to fetch talukas", err);
    }
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setFormData((prev) => ({ ...prev, assignedTalukas: [] }));
    if (district) {
      fetchTalukas(district);
    }
  };

  const handleTalukaToggle = (taluka: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedTalukas: prev.assignedTalukas.includes(taluka)
        ? prev.assignedTalukas.filter((t) => t !== taluka)
        : [...prev.assignedTalukas, taluka],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          assignedDistrict: selectedDistrict,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to invite user");
        return;
      }

      setSuccess("Invitation sent successfully!");
      setShowModal(false);
      setFormData({
        name: "",
        email: "",
        mobile: "",
        role: "DISTRICT_HEAD",
        assignedTalukas: [],
      });
      setSelectedDistrict("");
      fetchUsers();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: "bg-purple-100 text-purple-700",
      DISTRICT_HEAD: "bg-blue-100 text-blue-700",
      TALUKA_HEAD: "bg-green-100 text-green-700",
    };
    return styles[role] || "bg-gray-100 text-gray-700";
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage users and their access</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            Invite User
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">Users</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No users found</h3>
            <p className="text-gray-500 mt-1">Invite your first user to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">District</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-400">{user.mobile}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.assignedDistrict || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Invite New User</h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-lg">
                    {success}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="DISTRICT_HEAD">District Head</option>
                    <option value="TALUKA_HEAD">Taluka Head</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">District</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select District</option>
                    {(locations.districts || []).map((district: string) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                {formData.role === "TALUKA_HEAD" && selectedDistrict && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Talukas</label>
                    <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                      {locations.talukas.length === 0 ? (
                        <p className="text-sm text-gray-400">No talukas available</p>
                      ) : (
                        locations.talukas.map((taluka) => (
                          <label key={taluka} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.assignedTalukas.includes(taluka)}
                              onChange={() => handleTalukaToggle(taluka)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">{taluka}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    }>
      <AdminUsersContent />
    </Suspense>
  );
}
