import { seedBlogs } from './seed-blogs.mjs';

seedBlogs()
  .then((summary) => {
    console.log(
      JSON.stringify(
        {
          ...summary,
          mode: 'update',
        },
        null,
        2,
      ),
    );
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
