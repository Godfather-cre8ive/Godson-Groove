import BookForm from '../BookForm';

export const metadata = { title: 'Create Book' };

export default function CreateBookPage() {
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-brand-dark mb-6">Add New Book</h2>
      <BookForm />
    </div>
  );
}
