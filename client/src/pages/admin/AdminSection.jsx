import AdminBooks from './AdminBooks';
import AdminLectures from './AdminLectures';

// Reuses the existing books/lectures CRUD for a standalone site section
// (البراعم, النساء) instead of duplicating admin forms — fixedCategory
// pins every create/edit to that section and hides the category picker.
const AdminSection = ({ sectionName }) => (
  <div>
    <AdminLectures fixedCategory={sectionName} />
    <div style={{ marginTop: '2.5rem' }}>
      <AdminBooks fixedCategory={sectionName} />
    </div>
  </div>
);

export default AdminSection;
