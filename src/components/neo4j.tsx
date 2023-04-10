import neo4j, { Driver } from 'neo4j-driver'

const driver: Driver = neo4j.driver(
    process.env.REACT_APP_NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(process.env.REACT_APP_NEO4J_USER || 'neo4j', process.env.REACT_APP_NEO4J_PASSWORD || 'password')
);

export default driver;