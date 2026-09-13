import { app } from './server';

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on: \n> http://localhost:${PORT}\n`))
}

export default app;