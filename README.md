# TaskFlow - Modern Todo Management App

A beautiful, modern, and feature-rich todo management application built with React, Supabase, and deployed on Vercel. TaskFlow helps users organize their tasks efficiently with a clean, intuitive interface and powerful features.

![TaskFlow Demo](https://todo-app-nebula.vercel.app)

## ✨ Features

### 🔐 **Authentication & Security**

- **Google OAuth Integration**: Secure sign-in with Google accounts
- **Supabase Authentication**: Robust user management and session handling
- **Protected Routes**: Secure access to user dashboards
- **Auto-redirect**: Seamless navigation between authenticated and public areas

### 🎨 **Modern UI/UX Design**

- **Minimalistic Design**: Clean, distraction-free interface
- **Dark/Light Theme Toggle**: User preference-based theming
- **Responsive Layout**: Perfect experience on desktop, tablet, and mobile
- **Smooth Animations**: Delightful micro-interactions and transitions
- **Google Material Icons**: Consistent and beautiful iconography
- **Poppins Font**: Modern, readable typography

### 📝 **Task Management**

- **Create, Read, Update, Delete (CRUD)**: Full task lifecycle management
- **Priority System**: Three-level priority (Low, Medium, High) with visual indicators
- **Due Dates**: Set and track task deadlines with overdue notifications
- **Task Descriptions**: Detailed descriptions for complex tasks
- **Completion Status**: Mark tasks as complete/incomplete
- **Soft Delete**: Move tasks to trash instead of permanent deletion

### 🔍 **Organization & Filtering**

- **Smart Search**: Real-time search through task titles and descriptions
- **Filter Views**:
  - All Tasks
  - Upcoming (Incomplete tasks)
  - Completed Tasks
  - Overdue Tasks
  - Trash (Deleted tasks)
- **Statistics Dashboard**: Visual overview of task completion and pending work

### 🎛️ **Advanced Interface Features**

- **Collapsible Sidebar**: Maximized workspace when needed
- **Modal Forms**: Clean, accessible task creation and editing
- **Form Validation**: Real-time validation with helpful error messages
- **Loading States**: Beautiful loading indicators and skeletons
- **Error Handling**: User-friendly error messages and fallbacks
- **Tooltips**: Helpful guidance throughout the interface

### 🌟 **Additional Features**

- **Personalized Greetings**: Time-based welcome messages
- **User Statistics**: Track productivity with completion metrics
- **404 Error Page**: Custom animated error page with space theme
- **PWA Ready**: Fast loading and app-like experience
- **Analytics Integration**: Vercel Analytics for usage insights

## 🚀 Tech Stack

### **Frontend**

- **React 19**: Latest React with modern hooks and features
- **Vite**: Lightning-fast build tool and development server
- **React Router DOM**: Client-side routing and navigation
- **CSS Variables**: Dynamic theming and consistent design system
- **Modern CSS**: Flexbox, Grid, and advanced animations

### **Backend & Database**

- **Supabase**:
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Authentication service
  - Auto-generated APIs

### **Deployment & DevOps**

- **Vercel**: Serverless deployment with automatic CI/CD
- **Environment Variables**: Secure configuration management
- **Custom Domain**: Professional deployment setup

## 📦 Installation & Setup

### **Prerequisites**

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Google Cloud Console account (for OAuth)

### **Local Development**

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/taskflow.git
   cd taskflow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   Run this SQL in your Supabase SQL editor:

   ```sql
   -- Create todos table
   CREATE TABLE todos (
     id BIGSERIAL PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     description TEXT,
     priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
     completed BOOLEAN NOT NULL DEFAULT false,
     due_date DATE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     deleted_at TIMESTAMP WITH TIME ZONE,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
   );

   -- Enable RLS
   ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view own todos" ON todos FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can insert own todos" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update own todos" ON todos FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "Users can delete own todos" ON todos FOR DELETE USING (auth.uid() = user_id);

   -- Create updated_at trigger
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = timezone('utc'::text, now());
     RETURN NEW;
   END;
   $$ language 'plpgsql';

   CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

5. **Configure Google OAuth**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add your domains to authorized origins
   - Add the credentials to Supabase Authentication settings

6. **Start development server**
   ```bash
   npm run dev
   ```

## 🌐 Deployment

### **Vercel Deployment**

1. **Connect to Vercel**

   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set environment variables in Vercel dashboard**

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **Update Supabase settings**
   - Add your Vercel domain to Supabase Authentication URLs
   - Update redirect URLs in Supabase settings

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
│   ├── Dashboard.jsx   # Main todo dashboard
│   ├── SignIn.jsx      # Authentication page
│   ├── NotFoundPage.jsx # 404 error page
│   └── css/            # Page-specific styles
├── config/             # Configuration files
│   └── SupabaseClient.jsx # Supabase client setup
├── App.jsx             # Main app component (intro page)
├── main.jsx            # Application entry point
└── index.css           # Global styles
```

## 🎯 Key Features in Detail

### **Task Priority System**

Tasks can be assigned three priority levels:

- **Low Priority**: Green indicator, for non-urgent tasks
- **Medium Priority**: Yellow indicator, for standard tasks
- **High Priority**: Red indicator, for urgent tasks

### **Smart Filtering**

The application provides multiple views:

- **All Tasks**: Complete overview of all user tasks
- **Upcoming**: Focus on incomplete tasks that need attention
- **Completed**: Review finished tasks and achievements
- **Overdue**: Immediate attention to past-due tasks

### **Responsive Design**

- Mobile-first approach with breakpoints at 768px and 480px
- Collapsible sidebar on smaller screens
- Touch-friendly interface elements
- Optimized typography and spacing for all screen sizes

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Token Management**: Secure authentication flow
- **Input Validation**: Both client and server-side validation
- **XSS Protection**: Sanitized inputs and outputs
- **HTTPS Enforcement**: Secure data transmission

## 🚀 Performance Optimizations

- **Code Splitting**: Optimized bundle sizes
- **Lazy Loading**: Components loaded on demand
- **Caching**: Efficient data caching strategies
- **CDN Delivery**: Fast global content delivery via Vercel
- **Image Optimization**: Responsive images and modern formats

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### **Development Guidelines**

1. Follow the existing code style and conventions
2. Write meaningful commit messages
3. Add comments for complex logic
4. Test your changes thoroughly
5. Update documentation as needed

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Supabase** for providing an excellent backend-as-a-service platform
- **Vercel** for seamless deployment and hosting
- **Google Fonts** for beautiful typography
- **Google Material Icons** for consistent iconography
- **React Community** for the amazing ecosystem and tools

## 📞 Support & Contact

If you have any questions, issues, or suggestions, please:

1. Check the [Issues](https://github.com/yourusername/taskflow/issues) page
2. Create a new issue if your problem isn't already reported
3. For general questions, start a [Discussion](https://github.com/yourusername/taskflow/discussions)

---

**Live Demo**: [https://todo-app-nebula.vercel.app](https://todo-app-nebula.vercel.app)

**Built with ❤️ using React, Supabase, and Vercel**
