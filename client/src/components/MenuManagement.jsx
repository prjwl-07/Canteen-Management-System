import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, X, Power, Upload, Image as ImageIcon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const MenuManagement = () => {
    const [items, setItems] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', price: '', category: 'Snacks', description: '', image: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get('/api/menu');
            setItems(res.data);
        } catch (error) {
            console.error("Failed to fetch menu:", error);
            toast.error("Could not load menu items");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Optional: Create a preview URL
            setFormData({ ...formData, image: '' }); // Clear URL input if file is selected
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.category) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('price', formData.price);
            data.append('category', formData.category);
            data.append('description', formData.description);

            if (imageFile) {
                data.append('image', imageFile);
            } else if (formData.image) {
                data.append('image', formData.image);
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (editingId) {
                await axios.put(`/api/menu/${editingId}`, data, config);
                toast.success("Item updated successfully");
            } else {
                await axios.post('/api/menu', data, config);
                toast.success("Item added successfully");
            }
            fetchItems();
            resetForm();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to save item");
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await axios.delete(`/api/menu/${id}`);
                toast.success("Item deleted");
                fetchItems();
            } catch (error) {
                toast.error("Failed to delete item");
            }
        }
    };

    const handleToggleAvailability = async (item) => {
        try {
            const updatedItem = { ...item, isAvailable: !item.isAvailable };
            await axios.put(`/api/menu/${item._id}`, updatedItem);
            toast.success(updatedItem.isAvailable ? "Item marked as Available" : "Item marked as Sold Out", {
                icon: updatedItem.isAvailable ? '🟢' : '🔴',
            });
            fetchItems();
        } catch (error) {
            console.error("Failed to toggle availability:", error);
            toast.error("Failed to update status");
        }
    };

    const handleEdit = (item) => {
        setFormData({
            name: item.name,
            price: item.price,
            category: item.category,
            description: item.description || '',
            image: item.image || ''
        });
        setEditingId(item._id);
        setImageFile(null); // Reset file input
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({ name: '', price: '', category: 'Snacks', description: '', image: '' });
        setImageFile(null);
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="p-8 bg-white rounded-[2rem] shadow-sm border border-secondary-100">
            <Toaster />
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black text-secondary-900 tracking-tight">Menu Items</h2>
                    <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest mt-1">Catalog Management</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase tracking-wider text-xs shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95"
                >
                    <Plus size={18} /> Add New Item
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-secondary-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-6">
                    <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-white max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="font-black text-2xl text-secondary-900 tracking-tighter">{editingId ? 'Edit Item' : 'Create Item'}</h3>
                                <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mt-1">Fill in the details</p>
                            </div>
                            <button onClick={resetForm} className="p-2 hover:bg-secondary-50 rounded-xl text-secondary-400 transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-1">Item Title</label>
                                <input
                                    type="text" placeholder="e.g. Schezwan Burger" className="w-full bg-secondary-50 border-none p-4 rounded-2xl font-bold placeholder:text-secondary-300 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-1">Price (₹)</label>
                                    <input
                                        type="number" placeholder="45" className="w-full bg-secondary-50 border-none p-4 rounded-2xl font-bold placeholder:text-secondary-300 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                        value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-1">Category</label>
                                    <select
                                        className="w-full bg-secondary-50 border-none p-4 rounded-2xl font-bold text-secondary-900 focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none"
                                        value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>Snacks</option>
                                        <option>Beverages</option>
                                        <option>Meals</option>
                                        <option>Breakfast</option>
                                    </select>
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-1">Item Image</label>

                                {/* Tabs/Switch between URL and Upload could go here, but we'll show both for simplicity */}
                                <div className="flex flex-col gap-3">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className={`flex items-center justify-center gap-3 w-full p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${imageFile ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-secondary-200 hover:border-primary-400 hover:bg-secondary-50 text-secondary-400'
                                                }`}
                                        >
                                            <Upload size={20} />
                                            <span className="font-bold text-sm">{imageFile ? imageFile.name : "Upload Image from Device"}</span>
                                        </label>
                                    </div>

                                    <div className="text-center text-xs font-bold text-secondary-300 uppercase tracking-widest">OR</div>

                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-300" size={18} />
                                        <input
                                            type="text" placeholder="Paste Image URL" className="w-full bg-secondary-50 border-none p-4 pl-12 rounded-2xl font-medium text-sm placeholder:text-secondary-300 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                            value={formData.image}
                                            onChange={e => {
                                                setFormData({ ...formData, image: e.target.value });
                                                setImageFile(null); // Clear file if URL is typed
                                            }}
                                            disabled={!!imageFile}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-1">Delicious Description</label>
                                <textarea
                                    placeholder="Brief summary of the dish..." className="w-full bg-secondary-50 border-none p-4 rounded-2xl font-medium text-sm placeholder:text-secondary-300 focus:ring-2 focus:ring-primary-500/20 transition-all h-24 resize-none"
                                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <button className="w-full bg-secondary-900 text-white py-5 rounded-2xl font-black uppercase tracking-wider shadow-xl shadow-secondary-200 mt-4 hover:bg-black transition-all active:scale-95">Save Product</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                    <div key={item._id} className="group flex justify-between items-center p-4 bg-secondary-50/50 rounded-3xl border border-transparent hover:border-primary-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-white rounded-2xl overflow-hidden shadow-sm border border-secondary-100 group-hover:scale-105 transition-transform duration-300">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-secondary-200"><Plus size={24} /></div>
                                )}
                            </div>
                            <div>
                                <p className="font-black text-secondary-900">{item.name}</p>
                                <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-0.5">₹{item.price} • {item.category}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleToggleAvailability(item)}
                                className={`p-3 rounded-2xl transition-all shadow-sm ${item.isAvailable ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-500 hover:bg-red-100 ring-2 ring-red-100'}`}
                                title={item.isAvailable ? "Mark as Sold Out" : "Mark as Available"}
                            >
                                <Power size={18} strokeWidth={item.isAvailable ? 2 : 3} />
                            </button>
                            <button onClick={() => handleEdit(item)} className="p-3 bg-white text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all shadow-sm"><Edit2 size={18} /></button>
                            <button onClick={() => handleDelete(item._id)} className="p-3 bg-white text-secondary-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MenuManagement;
