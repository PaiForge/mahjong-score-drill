'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-100 via-white to-blue-50 overflow-hidden">
                {/* Background Accents */}
                <div className="absolute top-10 right-10 opacity-10 blur-3xl w-96 h-96 bg-blue-400 rounded-full" />
                <div className="absolute bottom-10 left-10 opacity-10 blur-3xl w-96 h-96 bg-purple-400 rounded-full" />

                <div className="text-center w-full max-w-5xl mx-auto space-y-12 z-10">
                    <div className="space-y-6">
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                麻雀点数計算
                            </span>
                            <br />
                            完全攻略
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            点数計算を大体は理解している人は早速問題を解いてみましょう。
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/problems/score"
                            className="bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <span>やってみる</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-6 bg-white border-y border-slate-100">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
                    {/* Feature 1 */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-2">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">ステップバイステップ</h3>
                        <p className="text-slate-600 leading-relaxed">
                            「雀頭」「面子」「待ち」など、要素ごとに分解されたドリルで基礎から着実に理解できます。
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-2">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">無限ランダム生成</h3>
                        <p className="text-slate-600 leading-relaxed">
                            問題はすべてアルゴリズムによる自動生成。同じ問題の繰り返しではなく、真の実力が身につきます。
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-2">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">スマホ最適化</h3>
                        <p className="text-slate-600 leading-relaxed">
                            移動中や隙間時間にも。スマートフォンで見やすく、操作しやすいデザインを追求しています。
                        </p>
                    </div>
                </div>
            </section>

            {/* Articles Section */}
            <section className="py-24 px-6 bg-slate-50 border-y border-slate-100">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h2 className="text-3xl font-bold text-slate-900">
                        まずはここから
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        点数計算の仕組みや、このサイトの活用方法について解説しています。
                    </p>

                    <Link
                        href="/articles/introduction"
                        className="group relative inline-flex items-center justify-center px-8 py-6 text-lg font-bold text-white transition-all duration-200 bg-slate-900 rounded-xl hover:bg-slate-800 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                    >
                        <span className="mr-2">はじめよう 🚀</span>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-slate-900 text-slate-400 text-center">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col items-center gap-6">
                        <div className="text-2xl font-bold text-white tracking-tight">
                            PaiForge
                        </div>
                        <div className="flex gap-6 text-sm">
                            <Link href="/articles/introduction" className="hover:text-white transition-colors">
                                点数計算とは
                            </Link>
                            <Link href="/cheatsheet" className="hover:text-white transition-colors">
                                点数早見表
                            </Link>
                        </div>
                        <div className="text-xs pt-4 border-t border-slate-800 w-full max-w-xs">
                            © {new Date().getFullYear()} Mahjong Score Drill
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
