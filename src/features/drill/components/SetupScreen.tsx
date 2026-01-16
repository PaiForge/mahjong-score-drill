

interface SetupScreenProps {
    onStart: () => void
}

export function SetupScreen({ onStart }: SetupScreenProps) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8 text-center space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        麻雀点数計算ドリル
                    </h1>
                    <p className="text-gray-600">
                        ランダムに出題される点数計算問題を解いて、
                        <br />
                        計算力を鍛えましょう。
                    </p>
                </div>

                <button
                    onClick={onStart}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors shadow-sm"
                >
                    スタート
                </button>
            </div>
        </div>
    )
}
