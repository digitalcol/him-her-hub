import SwiftUI
import WebKit

struct ClubWebView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> ClubController {
        ClubController()
    }

    func updateUIViewController(_ controller: ClubController, context: Context) {}
}

final class ClubController: UIViewController, WKNavigationDelegate {
    private var webView: WKWebView!
    private let note = UILabel()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.988, green: 0.988, blue: 0.980, alpha: 1)

        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        webView = WKWebView(frame: view.bounds, configuration: configuration)
        webView.navigationDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webView.isOpaque = true
        webView.backgroundColor = view.backgroundColor
        view.addSubview(webView)

        note.translatesAutoresizingMaskIntoConstraints = false
        note.textColor = UIColor(white: 0.1, alpha: 1)
        note.font = .systemFont(ofSize: 17)
        note.numberOfLines = 0
        note.textAlignment = .center
        note.isHidden = true
        view.addSubview(note)
        NSLayoutConstraint.activate([
            note.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 28),
            note.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -28),
            note.centerYAnchor.constraint(equalTo: view.centerYAnchor),
        ])

        let refresh = UIRefreshControl()
        refresh.addTarget(self, action: #selector(reload(_:)), for: .valueChanged)
        webView.scrollView.refreshControl = refresh

        if let url = URL(string: "https://www.himherhub.com") {
            webView.load(URLRequest(url: url))
        }
    }

    @objc private func reload(_ sender: UIRefreshControl) {
        note.isHidden = true
        if webView.url == nil, let url = URL(string: "https://www.himherhub.com") {
            webView.load(URLRequest(url: url))
        } else {
            webView.reload()
        }
        sender.endRefreshing()
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        note.isHidden = true
        webView.scrollView.refreshControl?.endRefreshing()
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        show(error)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        show(error)
    }

    private func show(_ error: Error) {
        if (error as NSError).code == NSURLErrorCancelled { return }
        note.text = "Could not open the club. Pull down to try again."
        note.isHidden = false
        webView.scrollView.refreshControl?.endRefreshing()
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.allow)
            return
        }
        let host = url.host?.lowercased() ?? ""
        let stays = host.isEmpty || host == "himherhub.com" || host.hasSuffix(".himherhub.com")
        if navigationAction.navigationType != .linkActivated || stays || url.scheme == "about" || url.scheme == "blob" {
            decisionHandler(.allow)
            return
        }
        UIApplication.shared.open(url)
        decisionHandler(.cancel)
    }
}
