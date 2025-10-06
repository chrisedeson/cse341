const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Book, Member, User } = require('./models');

// Load environment variables
dotenv.config();

// Sample books data
const sampleBooks = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    genre: "Fiction",
    publishedYear: 1925,
    availableCopies: 3,
    totalCopies: 5,
    description: "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
    publisher: "Scribner",
    language: "English",
    pageCount: 180
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    genre: "Fiction",
    publishedYear: 1960,
    availableCopies: 2,
    totalCopies: 4,
    description: "A gripping tale of racial injustice and childhood innocence in the American South.",
    publisher: "J.B. Lippincott & Co.",
    language: "English",
    pageCount: 376
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "9780452284234",
    genre: "Sci-Fi",
    publishedYear: 1949,
    availableCopies: 4,
    totalCopies: 6,
    description: "A dystopian novel about totalitarianism and surveillance in a future society.",
    publisher: "Secker & Warburg",
    language: "English",
    pageCount: 328
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "9780141439518",
    genre: "Romance",
    publishedYear: 1813,
    availableCopies: 3,
    totalCopies: 3,
    description: "A romantic novel about manners, upbringing, morality, and marriage in Georgian England.",
    publisher: "T. Egerton",
    language: "English",
    pageCount: 432
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    isbn: "9780316769174",
    genre: "Fiction",
    publishedYear: 1951,
    availableCopies: 2,
    totalCopies: 4,
    description: "A controversial novel about teenage rebellion and alienation in post-war America.",
    publisher: "Little, Brown and Company",
    language: "English",
    pageCount: 277
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    isbn: "9780747532699",
    genre: "Fantasy",
    publishedYear: 1997,
    availableCopies: 5,
    totalCopies: 8,
    description: "The first book in the Harry Potter series about a young wizard's adventures.",
    publisher: "Bloomsbury",
    language: "English",
    pageCount: 223
  },
  {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    isbn: "9780544003415",
    genre: "Fantasy",
    publishedYear: 1954,
    availableCopies: 1,
    totalCopies: 3,
    description: "An epic high fantasy novel about the quest to destroy the One Ring.",
    publisher: "George Allen & Unwin",
    language: "English",
    pageCount: 1216
  },
  {
    title: "The Da Vinci Code",
    author: "Dan Brown",
    isbn: "9780307474278",
    genre: "Mystery",
    publishedYear: 2003,
    availableCopies: 2,
    totalCopies: 4,
    description: "A mystery thriller involving secret societies and religious history.",
    publisher: "Doubleday",
    language: "English",
    pageCount: 454
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "9780553380163",
    genre: "Science",
    publishedYear: 1988,
    availableCopies: 3,
    totalCopies: 3,
    description: "A landmark volume in science writing that explores the nature of time and the universe.",
    publisher: "Bantam Doubleday Dell",
    language: "English",
    pageCount: 256
  },
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    isbn: "9781451648539",
    genre: "Biography",
    publishedYear: 2011,
    availableCopies: 2,
    totalCopies: 2,
    description: "The exclusive biography of Apple co-founder Steve Jobs.",
    publisher: "Simon & Schuster",
    language: "English",
    pageCount: 656
  }
];

// Sample users data
const sampleUsers = [
  {
    username: "admin",
    email: "admin@library.com",
    password: "admin123",
    role: "admin"
  },
  {
    username: "librarian",
    email: "librarian@library.com",
    password: "lib123",
    role: "user"
  },
  {
    username: "johndoe",
    email: "john.doe@email.com",
    password: "john123",
    role: "user"
  },
  {
    username: "janedoe",
    email: "jane.doe@email.com",
    password: "jane123",
    role: "user"
  }
];

// Sample members data
const sampleMembers = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+1234567890",
    address: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "12345"
    },
    membershipType: "Basic",
    isActive: true
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@email.com",
    phone: "+1987654321",
    address: {
      street: "456 Oak Ave",
      city: "Springfield",
      state: "IL",
      zipCode: "62701"
    },
    membershipType: "Premium",
    isActive: true
  },
  {
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.johnson@email.com",
    phone: "+1555123456",
    address: {
      street: "789 Pine Rd",
      city: "Portland",
      state: "OR",
      zipCode: "97201"
    },
    membershipType: "Student",
    isActive: true
  },
  {
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@email.com",
    phone: "+1555987654",
    address: {
      street: "321 Elm St",
      city: "Austin",
      state: "TX",
      zipCode: "73301"
    },
    membershipType: "Basic",
    isActive: true
  },
  {
    firstName: "Robert",
    lastName: "Wilson",
    email: "robert.wilson@email.com",
    phone: "+1555456789",
    address: {
      street: "654 Maple Dr",
      city: "Denver",
      state: "CO",
      zipCode: "80201"
    },
    membershipType: "Senior",
    isActive: true
  },
  {
    firstName: "Sarah",
    lastName: "Brown",
    email: "sarah.brown@email.com",
    phone: "+1555321654",
    address: {
      street: "987 Cedar Ln",
      city: "Seattle",
      state: "WA",
      zipCode: "98101"
    },
    membershipType: "Premium",
    isActive: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Clear existing data
    console.log('Clearing existing data...');
    await Book.deleteMany({});
    await Member.deleteMany({});
    await User.deleteMany({});
    console.log('Existing data cleared!');

    // Insert sample users
    console.log('Inserting sample users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`✅ ${createdUsers.length} users inserted successfully!`);

    // Insert sample books
    console.log('Inserting sample books...');
    const createdBooks = await Book.insertMany(sampleBooks);
    console.log(`✅ ${createdBooks.length} books inserted successfully!`);

    // Insert sample members
    console.log('Inserting sample members...');
    const createdMembers = await Member.insertMany(sampleMembers);
    console.log(`✅ ${createdMembers.length} members inserted successfully!`);

    // Create some borrowing records for demonstration
    console.log('Creating sample borrowing records...');
    const member1 = createdMembers[0];
    const member2 = createdMembers[1];
    const book1 = createdBooks[0]; // The Great Gatsby
    const book2 = createdBooks[2]; // 1984

    // Member 1 borrows The Great Gatsby
    const borrowDate1 = new Date();
    const dueDate1 = new Date(borrowDate1);
    dueDate1.setDate(dueDate1.getDate() + 14);
    
    member1.borrowedBooks.push({
      bookId: book1._id,
      borrowDate: borrowDate1,
      dueDate: dueDate1
    });
    book1.availableCopies -= 1;

    // Member 2 borrows 1984
    const borrowDate2 = new Date();
    const dueDate2 = new Date(borrowDate2);
    dueDate2.setDate(dueDate2.getDate() + 14);

    member2.borrowedBooks.push({
      bookId: book2._id,
      borrowDate: borrowDate2,
      dueDate: dueDate2
    });
    book2.availableCopies -= 1;

    await member1.save();
    await member2.save();
    await book1.save();
    await book2.save();

    console.log('✅ Sample borrowing records created!');

    // Display summary
    console.log('\n🎉 Database seeded successfully!');
    console.log('═══════════════════════════════════');
    console.log(`📚 Books inserted: ${createdBooks.length}`);
    console.log(`👥 Members inserted: ${createdMembers.length}`);
    console.log(`📖 Active borrowings: 2`);
    console.log('═══════════════════════════════════');
    console.log('\n📋 Summary of data:');
    console.log('Books by genre:');
    const genreCount = {};
    sampleBooks.forEach(book => {
      genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
    });
    Object.entries(genreCount).forEach(([genre, count]) => {
      console.log(`  - ${genre}: ${count}`);
    });
    
    console.log('\nMembers by type:');
    const memberTypeCount = {};
    sampleMembers.forEach(member => {
      memberTypeCount[member.membershipType] = (memberTypeCount[member.membershipType] || 0) + 1;
    });
    Object.entries(memberTypeCount).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });

    console.log('\nUsers by role:');
    const userRoleCount = {};
    sampleUsers.forEach(user => {
      userRoleCount[user.role] = (userRoleCount[user.role] || 0) + 1;
    });
    Object.entries(userRoleCount).forEach(([role, count]) => {
      console.log(`  - ${role}: ${count}`);
    });

    console.log('\n🚀 Your API is ready to use!');
    console.log('Test endpoints:');
    console.log('  - POST /api/auth/register (create account)');
    console.log('  - POST /api/auth/login (get token)');
    console.log('  - GET /api/books (requires auth for protected routes)');
    console.log('  - GET /api/members (requires auth for protected routes)');
    console.log('  - GET /api-docs (Swagger UI)');
    console.log('\nSample login credentials:');
    console.log('  - Admin: admin / admin123');
    console.log('  - User: johndoe / john123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📊 Database connection closed.');
    process.exit(0);
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleBooks, sampleMembers, sampleUsers };