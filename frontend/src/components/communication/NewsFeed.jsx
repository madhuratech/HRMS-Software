import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Megaphone,
  Pin,
  MessageSquare,
  ThumbsUp } from
'lucide-react';
import { format } from 'date-fns';

const MOCK_NEWS = [
{
  id: '1',
  title: 'New Branch Opening in Chicago Downtown',
  content: 'We are thrilled to announce the grand opening of our new flagship branch in Chicago Downtown! This expansion marks a significant milestone in our growth strategy. All staff are invited to the virtual inauguration ceremony next Friday.',
  author: 'Sarah Johnson',
  role: 'CEO',
  date: '2023-10-24T09:00:00',
  category: 'GENERAL',
  pinned: true,
  likes: 45,
  comments: 12
},
{
  id: '2',
  title: 'Q4 Incentive Structure Update',
  content: 'Please note the following changes to the Q4 Sales Incentive Structure. We have introduced a new tier for exceeding targets by 20%. Review the attached document for detailed breakdown.',
  author: 'Michael Chen',
  role: 'Sales Director',
  date: '2023-10-23T14:30:00',
  category: 'SALES',
  pinned: false,
  likes: 28,
  comments: 5
},
{
  id: '3',
  title: 'System Maintenance Scheduled',
  content: 'The CRM system will undergo scheduled maintenance this Sunday from 2:00 AM to 4:00 AM EST. Please ensure all data is saved before this time. We apologize for any inconvenience.',
  author: 'IT Support',
  role: 'System Admin',
  date: '2023-10-22T10:00:00',
  category: 'URGENT',
  pinned: true,
  likes: 15,
  comments: 2
},
{
  id: '4',
  title: 'Health & Wellness Workshop',
  content: 'Join us for a virtual wellness workshop focused on stress management and work-life balance. Hosted by Dr. Emily White on Wednesday at 3 PM.',
  author: 'Jessica Davis',
  role: 'HR Manager',
  date: '2023-10-20T11:15:00',
  category: 'HR',
  pinned: false,
  likes: 32,
  comments: 8
}];


export function NewsFeed() {
  const [posts, setPosts] = useState(MOCK_NEWS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Post Form State

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('GENERAL');

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || post.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = (e) => {
    e.preventDefault();
    const newPost = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      author: 'Current User', // Mocked
      role: 'Admin',
      date: new Date().toISOString(),
      category: newCategory,
      pinned: false,
      likes: 0,
      comments: 0
    };
    setPosts([newPost, ...posts]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewContent('');
    setNewCategory('GENERAL');
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'URGENT':return 'bg-red-100 text-red-700 border-red-200';
      case 'HR':return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'SALES':return 'bg-green-100 text-green-700 border-green-200';
      case 'SERVICE':return 'bg-blue-100 text-blue-700 border-blue-200';
      default:return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="text-blue-600" /> Company News & Announcements
          </h1>
          <p className="text-slate-500 mt-1">Stay updated with the latest organization updates.</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm">
          
          <Plus size={18} /> Create Announcement
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search announcements..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
          
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <Filter size={18} className="text-slate-400" />
          {['ALL', 'GENERAL', 'URGENT', 'HR', 'SALES', 'SERVICE'].map((cat) =>
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            categoryFilter === cat ?
            'bg-slate-800 text-white' :
            'bg-slate-100 text-slate-600 hover:bg-slate-200'}`
            }>
            
              {cat}
            </button>
          )}
        </div>
      </div>

      {/* News Feed Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPosts.map((post) =>
        <div key={post.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${post.pinned ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200'}`}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${post.role === 'CEO' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{post.author}</h3>
                    <p className="text-xs text-slate-500">{post.role} • {format(new Date(post.date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {post.pinned &&
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">
                      <Pin size={12} fill="currentColor" /> Pinned
                    </span>
                }
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                  <button className="text-slate-300 hover:text-slate-600 p-1">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-3">{post.title}</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line mb-6">
                {post.content}
              </p>

              <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                <button className="flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">
                  <ThumbsUp size={18} />
                  {post.likes} Likes
                </button>
                <button className="flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">
                  <MessageSquare size={18} />
                  {post.comments} Comments
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredPosts.length === 0 &&
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <Megaphone className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-700">No announcements found</h3>
            <p className="text-slate-500">Try adjusting your search or filters.</p>
          </div>
        }
      </div>

      {/* Create Modal */}
      {showCreateModal &&
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">New Announcement</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <XIcon />
              </button>
            </div>
            
            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., Office Closure Notice"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)} />
              
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                <select
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}>
                
                  <option value="GENERAL">General</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HR">HR</option>
                  <option value="SALES">Sales</option>
                  <option value="SERVICE">Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Content</label>
                <textarea
                required
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Write your announcement here..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)} />
              
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">
                
                  Cancel
                </button>
                <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                
                  Post Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>);

}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 18 18" />
    </svg>);

}