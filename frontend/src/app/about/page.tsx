export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">About Me</h1>
      
      <div className="max-w-3xl mx-auto">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Who I Am</h2>
          <p className="text-gray-600 mb-4">
            I&apos;m a passionate full-stack developer with experience in building modern web applications
            using a variety of technologies. My journey in software development started several years ago,
            and I&apos;ve been constantly learning and improving my skills since then.
          </p>
          <p className="text-gray-600">
            With a strong foundation in both frontend and backend development, I enjoy creating
            seamless, user-friendly experiences that solve real-world problems.
          </p>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-medium mb-2">Frontend</h3>
              <ul className="list-disc pl-5 text-gray-600">
                <li>TypeScript/JavaScript</li>
                <li>React.js</li>
                <li>Next.js</li>
                <li>HTML/CSS</li>
                <li>Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Backend</h3>
              <ul className="list-disc pl-5 text-gray-600">
                <li>Python (Flask, Django)</li>
                <li>Node.js</li>
                <li>RESTful APIs</li>
                <li>Database Design</li>
                <li>SQL/NoSQL</li>
              </ul>
            </div>
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Experience</h2>
          <div className="border-l-2 border-gray-200 pl-4">
            <div className="mb-6">
              <h3 className="text-xl font-medium">Senior Developer</h3>
              <p className="text-gray-500 italic">Company Name • 2020 - Present</p>
              <p className="text-gray-600 mt-2">
                Leading development of web applications, mentoring junior developers,
                and implementing best practices for code quality and performance.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium">Web Developer</h3>
              <p className="text-gray-500 italic">Previous Company • 2017 - 2020</p>
              <p className="text-gray-600 mt-2">
                Developed and maintained client websites, collaborated with design team,
                and implementing responsive design principles.
              </p>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Education</h2>
          <div>
            <h3 className="text-xl font-medium">Bachelor of Science in Computer Science</h3>
            <p className="text-gray-500 italic">University Name • 2013 - 2017</p>
          </div>
        </section>
      </div>
    </div>
  );
} 