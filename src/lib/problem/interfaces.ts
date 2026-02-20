export interface ProblemGenerator<TQuestion, TOptions = void> {
    generate(options?: TOptions): TQuestion
}
