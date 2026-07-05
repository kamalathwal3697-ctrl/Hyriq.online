import bcrypt from 'bcryptjs';

const hash = "$2a$10$3ui4tWcwV21EBYbU8iC.t.rRxaXlh6ThVlF9VBM5/kkjPAoqXYJdi";
const passwords = ["password", "password123", "hyriq", "hyriqpassword", "alex", "alex123", "test", "candidate", "candidate123", "test-candidate-1"];

for (const p of passwords) {
  if (bcrypt.compareSync(p, hash)) {
    console.log("MATCH FOUND: " + p);
    process.exit(0);
  }
}
console.log("No match found");
