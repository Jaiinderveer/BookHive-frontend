import { useAuth } from '../context/AuthContext.jsx'
import LibrarianBooks from './librarian/Books.jsx'
import MemberBrowseBooks from './member/BrowseBooks.jsx'

// /books is shared: librarians get management, members get a read-only catalog.
export default function BooksPage() {
  const { isLibrarian } = useAuth()
  return isLibrarian ? <LibrarianBooks /> : <MemberBrowseBooks />
}
