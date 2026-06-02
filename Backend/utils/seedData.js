const Grade = require('../models/Grade');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Note = require('../models/Note');
const StudyQuiz = require('../models/StudyQuiz');

const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');

const seedDefaultCurriculum = async () => {
  const existing = await Grade.findOne({ slug: 'class-10' });
  if (existing) return;

  const gradeDefinitions = [
    { name: 'Class 6', slug: 'class-6', description: 'CBSE Class 6 curriculum' },
    { name: 'Class 7', slug: 'class-7', description: 'CBSE Class 7 curriculum' },
    { name: 'Class 8', slug: 'class-8', description: 'CBSE Class 8 curriculum' },
    { name: 'Class 9', slug: 'class-9', description: 'CBSE Class 9 curriculum' },
    { name: 'Class 10', slug: 'class-10', description: 'CBSE Class 10 curriculum' },
    { name: 'Class 11', slug: 'class-11', description: 'CBSE Class 11 curriculum' },
    { name: 'Class 12', slug: 'class-12', description: 'CBSE Class 12 curriculum' }
  ];

  const grades = await Grade.insertMany(gradeDefinitions);
  const class10 = grades.find((g) => g.slug === 'class-10');

  const subjects = await Subject.insertMany([
    {
      grade: class10._id,
      title: 'Mathematics',
      slug: 'mathematics',
      shortTitle: 'Real Numbers · Algebra',
      description: 'CBSE Class 10 Mathematics topics, formulas, and practice guidance.',
      order: 1
    },
    {
      grade: class10._id,
      title: 'Science',
      slug: 'science',
      shortTitle: 'Chemistry · Physics · Biology',
      description: 'Class 10 Science with chemistry reactions, physics, and biology fundamentals.',
      order: 2
    },
    {
      grade: class10._id,
      title: 'Social Science',
      slug: 'social-science',
      shortTitle: 'History · Geography · Civics',
      description: 'CBSE Social Science lessons for history, geography, and political science.',
      order: 3
    },
    {
      grade: class10._id,
      title: 'English',
      slug: 'english',
      shortTitle: 'Literature · Writing Skills',
      description: 'English chapters, writing practice, and reading comprehension for Class 10.',
      order: 4
    },
    {
      grade: class10._id,
      title: 'Hindi',
      slug: 'hindi',
      shortTitle: 'Kshitij · Kritika',
      description: 'Hindi textbook chapters, grammar, and writing practice for Class 10.',
      order: 5
    }
  ]);

  const chapterDefinitions = [
    {
      subjectSlug: 'mathematics',
      title: 'Real Numbers',
      slug: 'real-numbers',
      summary: 'Understand the fundamental properties of real numbers, the number line, and operations with rational and irrational numbers.',
      formulas: ['Euclid’s division lemma', 'Rational numbers are closed under addition, subtraction, multiplication and division (except by zero).'],
      importantQuestions: ['Find the decimal expansion of √2.', 'Prove that √5 is irrational.'],
      previousYearQuestions: ['If p and q are irrational, prove that p + q may be rational.', 'Express 0.999... as a fraction.'],
      order: 1
    },
    {
      subjectSlug: 'mathematics',
      title: 'Polynomials',
      slug: 'polynomials',
      summary: 'Learn polynomial identities, zeroes, factorization, and the relationship between zeroes and coefficients.',
      formulas: ['If α and β are roots of ax^2+bx+c=0, then α+β = -b/a and αβ = c/a.'],
      importantQuestions: ['Factorize x^2 - 5x + 6.', 'Find the roots of x^2 + x - 6 = 0.'],
      previousYearQuestions: ['If α and β are zeros of a quadratic, find k when roots differ by 3.'],
      order: 2
    },
    {
      subjectSlug: 'science',
      title: 'Chemical Reactions',
      slug: 'chemical-reactions',
      summary: 'Explore chemical reactions, equations, types of reactions, and how to balance them correctly.',
      formulas: ['Reactants → Products', 'Acid + Base → Salt + Water'],
      importantQuestions: ['Balance the equation: Fe + O2 → Fe2O3.', 'Classify the reaction of acid with metal.'],
      previousYearQuestions: ['State the law of conservation of mass.'],
      order: 1
    },
    {
      subjectSlug: 'science',
      title: 'Light Reflection and Refraction',
      slug: 'light-reflection-refraction',
      summary: 'Study how light travels, reflects from mirrors, and refracts through lenses with ray diagrams.',
      formulas: ['1/f = 1/v + 1/u', 'Magnification = height of image / height of object'],
      importantQuestions: ['Draw the ray diagram for a concave mirror.', 'Compute the focal length of a lens.'],
      previousYearQuestions: ['Define the refractive index of a medium.'],
      order: 2
    },
    {
      subjectSlug: 'social-science',
      title: 'History',
      slug: 'history',
      summary: 'Understand important events, movements, and ideas that shaped modern India and the world.',
      formulas: [],
      importantQuestions: ['Explain the significance of the Non-Cooperation Movement.', 'Describe the role of peasant uprisings in colonial India.'],
      previousYearQuestions: ['What were the primary causes of the First World War?'],
      order: 1
    },
    {
      subjectSlug: 'english',
      title: 'First Flight',
      slug: 'first-flight',
      summary: 'Review the stories from the First Flight textbook and learn how to analyze characters and themes.',
      formulas: [],
      importantQuestions: ['Summarize the chapter “A Letter to God”.', 'What moral lesson does “The Black Spot” teach?'],
      previousYearQuestions: ['What is the main idea of “Dust of Snow”?'],
      order: 1
    }
  ];

  const createdChapters = [];
  for (const chapterData of chapterDefinitions) {
    const subject = subjects.find((s) => s.slug === chapterData.subjectSlug);
    if (!subject) continue;
    const chapter = await Chapter.create({
      subject: subject._id,
      title: chapterData.title,
      slug: chapterData.slug,
      summary: chapterData.summary,
      formulas: chapterData.formulas,
      importantQuestions: chapterData.importantQuestions,
      previousYearQuestions: chapterData.previousYearQuestions,
      order: chapterData.order
    });
    createdChapters.push(chapter);
  }

  for (const chapter of createdChapters) {
    await Note.create({
      chapter: chapter._id,
      title: `${chapter.title} Notes`,
      content: `${chapter.summary} This note helps you revise the key ideas and memorize the fundamentals for exam preparation.`,
      type: 'note',
      order: 1
    });
  }

  const mathChapter = createdChapters.find((chapter) => chapter.slug === 'real-numbers');
  if (mathChapter) {
    await StudyQuiz.create({
      chapter: mathChapter._id,
      title: 'Real Numbers Practice Quiz',
      description: 'A quick quiz for Real Numbers and irrational numbers.',
      questions: [
        {
          questionText: 'Which of the following is an irrational number?',
          options: ['3/4', '√2', '0.75', '2'],
          correctOption: 1,
          explanation: '√2 cannot be expressed as a ratio of two integers.',
          topic: 'Real Numbers'
        },
        {
          questionText: 'Which statement about rational numbers is true?',
          options: ['They have terminating or repeating decimals', 'They are always positive', 'They are never fractions', 'They cannot be written as p/q'],
          correctOption: 0,
          explanation: 'Rational numbers have terminating or repeating decimal expansions.',
          topic: 'Real Numbers'
        }
      ]
    });
  }

  const polyChapter = createdChapters.find((chapter) => chapter.slug === 'polynomials');
  if (polyChapter) {
    await StudyQuiz.create({
      chapter: polyChapter._id,
      title: 'Polynomials Practice Quiz',
      description: 'Review factorization and zeroes of polynomials.',
      questions: [
        {
          questionText: 'The zeroes of the polynomial x^2 - 5x + 6 are:',
          options: ['2 and 3', '1 and 6', '3 and 3', '0 and 6'],
          correctOption: 0,
          explanation: 'x^2 - 5x + 6 = (x-2)(x-3).',
          topic: 'Polynomials'
        }
      ]
    });
  }

  console.log('✅ Seed data initialized for CBSE Class 10 curriculum.');
};

module.exports = { seedDefaultCurriculum };
