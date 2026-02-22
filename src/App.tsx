import { useState, useEffect } from 'react';
import { Copy, Trash2, Terminal, CheckCircle2, ChevronRight, Delete } from 'lucide-react';

const App = () => {
  const [wordlist, setWordlist] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [currentPrefix, setCurrentPrefix] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // 派生データの計算
  const matchingWords = currentPrefix === '' 
    ? [] 
    : wordlist.filter(word => word.startsWith(currentPrefix));
  
  // 次の入力候補の文字を抽出（存在する文字だけを抽出）
  const nextChars = currentPrefix === ''
    ? "abcdefghijklmnopqrstuvwxyz".split('') // 最初は全アルファベット
    : Array.from(new Set(matchingWords.map(w => w[currentPrefix.length]).filter(Boolean))).sort();

  // コンポーネントマウント時にBIP39英単語リスト(2048語)を公式リポジトリから取得
  useEffect(() => {
    const fetchWordlist = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/english.txt');
        if (!response.ok) throw new Error('Network response was not ok');
        const text = await response.text();
        const words = text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
        setWordlist(words);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch wordlist", error);
        // フェッチ失敗時のフォールバック（デモ用にいくつかだけ用意）
        setWordlist(["abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act", "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit", "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent", "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert"]);
        setIsLoading(false);
      }
    };
    fetchWordlist();
  }, []);

  // 文字パネルをクリックした時の処理
  const handleCharClick = (char: string) => {
    setCurrentPrefix(prev => prev + char);
  };

  // 1文字戻る処理
  const handleBackspace = () => {
    setCurrentPrefix(prev => prev.slice(0, -1));
  };

  // 単語を確定してリストに追加
  const selectWord = (word: string) => {
    if (selectedWords.length < 24) {
      setSelectedWords([...selectedWords, word]);
      setCurrentPrefix(''); // プレフィックスをリセット
    }
  };

  // 特定の単語をリストから削除
  const removeWord = (index: number) => {
    const newWords = [...selectedWords];
    newWords.splice(index, 1);
    setSelectedWords(newWords);
  };

  // クリップボードにコピー
  const handleCopy = () => {
    if (selectedWords.length === 0) return;
    const phrase = selectedWords.join(' ');
    // 汎用的なコピー処理
    const textArea = document.createElement("textarea");
    textArea.value = phrase;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  // 全てクリア
  const handleClear = () => {
    setSelectedWords([]);
    setCurrentPrefix('');
  };

  // サジェストの文字色ハイライト（入力済み部分を白、残りを緑に）
  const highlightPrefix = (word: string, prefix: string) => {
    const start = word.slice(0, prefix.length);
    const rest = word.slice(prefix.length);
    return (
      <>
        <span className="text-white font-bold">{start}</span>
        <span className="text-green-500/70">{rest}</span>
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center font-mono text-green-500">
        <Terminal className="animate-pulse mr-2" />
        <span>INITIALIZING NEURAL LINK...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-green-400 font-mono p-4 sm:p-6 md:p-8 flex flex-col items-center">
      
      <div className="w-full max-w-3xl bg-gray-900 border border-green-500/30 rounded-xl shadow-2xl shadow-green-900/20 overflow-hidden mt-4">
        
        {/* ヘッダー */}
        <div className="bg-gray-950 border-b border-green-500/30 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Terminal className="w-5 h-5 mr-2 text-green-500" />
            <h1 className="text-lg font-bold tracking-widest text-green-500">BIP39_PREDICT_UI</h1>
          </div>
          <div className="text-xs px-2 py-1 bg-green-900/30 rounded border border-green-500/50">
            WORDS: <span className="text-white font-bold">{selectedWords.length}</span> / 24
          </div>
        </div>

        {/* 入力済み単語の表示エリア */}
        <div className="p-4 sm:p-6 min-h-[160px] bg-gray-900/50 flex flex-wrap gap-2 content-start">
          {selectedWords.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-green-500/30 mt-4">
              <span className="text-sm">AWAITING INPUT...</span>
              <span className="text-xs mt-2">BIP39単語は最初の4文字で特定可能です</span>
            </div>
          ) : (
            selectedWords.map((word, index) => (
              <div 
                key={index} 
                className="group flex items-center bg-gray-800 border border-green-500/40 rounded px-2 py-1 text-sm cursor-pointer hover:border-red-500/50 hover:bg-red-900/20 transition-colors"
                onClick={() => removeWord(index)}
                title="クリックで削除"
              >
                <span className="text-green-600 mr-2 text-xs w-4 text-right">{index + 1}.</span>
                <span className="text-white font-medium">{word}</span>
              </div>
            ))
          )}
        </div>

        {/* クリック選択エリア（旧入力エリア） */}
        <div className="p-4 sm:p-6 border-t border-green-500/30 bg-gray-950 relative">
          {selectedWords.length >= 24 ? (
            <div className="text-center text-green-500 py-8 font-bold text-xl border-2 border-dashed border-green-500/50 rounded-lg bg-green-900/10">
              MAXIMUM WORDS REACHED
            </div>
          ) : (
            <>
              {/* プレフィックス表示バー */}
              <div className="flex items-center bg-gray-900 border-2 border-green-500/50 rounded-lg p-2 mb-4 shadow-inner shadow-black">
                <ChevronRight className="w-5 h-5 text-green-500 mr-2" />
                <div className="flex-1 flex space-x-1 items-center min-h-[32px]">
                  {currentPrefix.length === 0 ? (
                    <span className="text-gray-500 text-sm italic">Select the first letter...</span>
                  ) : (
                    currentPrefix.split('').map((char, i) => (
                      <span key={i} className="px-3 py-1 bg-green-900/60 text-white font-bold uppercase rounded border border-green-500/30">
                        {char}
                      </span>
                    ))
                  )}
                  {/* カーソル風エフェクト */}
                  <span className="w-2 h-5 bg-green-500/70 animate-pulse ml-1"></span>
                </div>
                {currentPrefix.length > 0 && (
                  <button 
                    onClick={handleBackspace}
                    className="p-2 text-red-400 hover:text-white hover:bg-red-900/50 rounded transition-colors"
                    title="Backspace"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* 文字選択パネル */}
              {nextChars.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-green-600 mb-2 tracking-wider">SELECT NEXT LETTER:</div>
                  <div className="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-9 gap-2">
                    {nextChars.map(char => (
                      <button
                        key={char}
                        onClick={() => handleCharClick(char)}
                        className="aspect-square flex items-center justify-center bg-gray-800 border border-green-500/30 rounded hover:bg-green-600 hover:border-green-400 hover:scale-105 active:scale-95 text-white text-lg font-bold uppercase transition-all shadow-[0_4px_6px_-1px_rgba(0,0,0,0.5)]"
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 単語候補パネル (2文字以上入力済み、または候補が40個以下の場合に表示) */}
              {(currentPrefix.length >= 2 || (currentPrefix.length > 0 && matchingWords.length <= 40)) && (
                <div className="mt-6 border-t border-green-500/20 pt-4 animate-in fade-in slide-in-from-top-2">
                  <div className="text-xs text-green-600 mb-2 tracking-wider">SELECT WORD ({matchingWords.length} MATCHES):</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {matchingWords.map(word => (
                      <button
                        key={word}
                        onClick={() => selectWord(word)}
                        className="flex justify-start items-center px-3 py-2 bg-gray-800 border border-green-500/30 rounded text-left hover:bg-green-900/60 hover:border-green-400 transition-all"
                      >
                        {highlightPrefix(word, currentPrefix)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* アクションボタン */}
        <div className="p-4 bg-gray-950 border-t border-green-500/20 flex justify-between gap-4">
          <button
            onClick={handleClear}
            disabled={selectedWords.length === 0}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-900 border border-red-500/30 text-red-400 rounded hover:bg-red-950 hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            CLEAR ALL
          </button>
          
          <button
            onClick={handleCopy}
            disabled={selectedWords.length === 0}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded font-bold transition-all ${
              copied 
                ? 'bg-green-500 text-gray-900 border border-green-500' 
                : 'bg-green-900/30 border border-green-500/50 text-green-400 hover:bg-green-800/40 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                COPIED!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                COPY PHRASE
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default App;
