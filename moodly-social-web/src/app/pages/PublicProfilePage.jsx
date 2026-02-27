import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSession } from "../api/authStore.js";
import { HttpError } from "../api/http.js";
import {
  getFollowers,
  getPublicProfile,
  getPublicPosts,
  follow,
  unfollow,
} from "../api/profileApi.js";
import {
  addComment,
  hydratePostsLikedByMe,
  like,
  listComments,
  replyToComment,
  unlike,
  updateComment,
} from "../api/postsApi.js";
import { MediaImage } from "../components/MediaImage.jsx";
import { PostCard } from "../components/PostCard.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { LoadingState } from "../components/LoadingState.jsx";
import { getAuthorAuraColor } from "../constants/moods.js";

export function PublicProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const me = session?.username || null;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [p, list] = await Promise.all([
        getPublicProfile(username),
        getPublicPosts(username),
      ]);
      let following = typeof p?.following === "boolean" ? p.following : null;
      if (following === null && me && p?.username && me !== p.username) {
        const followers = await getFollowers(p.username);
        following =
          Array.isArray(followers) && followers.some((u) => u?.username === me);
      }
      const profileData = p && typeof p === "object" ? p : {};
      setProfile({
        ...profileData,
        following: following ?? false,
      });
      const normalizedPosts = await hydratePostsLikedByMe(
        Array.isArray(list) ? list : [],
        me,
      );
      setPosts(normalizedPosts);
    } catch (e) {
      if (e instanceof HttpError && e.status === 404) {
        navigate("/404", { replace: true });
        return;
      }
      setError(e?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [username, me, navigate]);

  const dominantMoodColor = useMemo(
    () => getAuthorAuraColor(posts.map((p) => p.mood)),
    [posts],
  );

  function countComments(nodes) {
    if (!Array.isArray(nodes)) return 0;
    return nodes.reduce(
      (total, node) => total + 1 + countComments(node.replies),
      0,
    );
  }

  async function refreshComments(postId) {
    try {
      const comments = await listComments(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments, commentsCount: countComments(comments) }
            : p,
        ),
      );
      return comments;
    } catch {
      return [];
    }
  }

  async function handleToggleLike(post) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== post.id) return p;
        const liked = !p.likedByMe;
        return {
          ...p,
          likedByMe: liked,
          likesCount: Math.max(0, (p.likesCount || 0) + (liked ? 1 : -1)),
        };
      }),
    );

    try {
      const res = post.likedByMe ? await unlike(post.id) : await like(post.id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, likedByMe: res.liked, likesCount: res.likesCount }
            : p,
        ),
      );
    } catch {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
    }
  }

  function openPostFromCard(event, id) {
    const interactive = event.target.closest(
      "button,a,input,textarea,select,label,[role='button']",
    );
    if (interactive) return;
    navigate(`/u/${encodeURIComponent(username)}/posts/${id}`);
  }

  async function handleAddComment(postId, content) {
    try {
      await addComment(postId, content);
      await refreshComments(postId);
    } catch (e) {
      setError(e?.message || "Failed to add comment");
    }
  }

  async function handleReplyComment(postId, parentCommentId, content) {
    try {
      await replyToComment(postId, parentCommentId, content);
      await refreshComments(postId);
    } catch (e) {
      setError(e?.message || "Failed to reply");
    }
  }

  async function handleEditComment(postId, commentId, content) {
    try {
      await updateComment(postId, commentId, content);
      await refreshComments(postId);
    } catch (e) {
      setError(e?.message || "Failed to edit comment");
    }
  }

  async function onToggleFollow() {
    if (!profile?.username) return;
    setBusy(true);
    setError(null);
    try {
      // backend returns FollowResponse { targetUsername, following, followersCount }
      const res = profile.following
        ? await unfollow(profile.username)
        : await follow(profile.username);
      setProfile((p) =>
        p
          ? {
              ...p,
              following: res.following,
              followersCount: res.followersCount,
            }
          : p,
      );
    } catch (e) {
      if (e instanceof HttpError && e.details?.errors)
        setError(Object.values(e.details.errors).join("\n"));
      else setError(e?.message || "Failed to update follow");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-[680px]">
          <LoadingState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-20 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex max-w-[680px] items-center justify-between px-3 py-3 sm:px-4">
          <div>
            <h1 className="text-lg font-semibold text-black/90">
              @{profile?.username || username}
            </h1>
            <p className="text-xs text-black/55">
              Followers {profile?.followersCount ?? 0} • Following{" "}
              {profile?.followingCount ?? 0}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/feed"
              className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white/60 px-3 text-xs font-medium text-black/75 transition hover:bg-black/5"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[680px] space-y-5 px-3 py-5 sm:px-4 sm:py-6">
        {error && (
          <div className="rounded-2xl border border-error-border bg-error-bg/95 px-4 py-3 text-sm text-error-text whitespace-pre-line">
            {error}
          </div>
        )}

        <Card className="glass-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className="h-16 w-16 overflow-hidden rounded-full bg-black/10 flex items-center justify-center ring-3 ring-offset-2"
                style={{ "--tw-ring-color": dominantMoodColor }}
              >
                {profile?.authorPicture?.url ? (
                  <MediaImage
                    url={profile.authorPicture.url}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-black/80 font-semibold text-xl">
                    {(profile?.username || "?")[0]?.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-black/85">
                  {profile?.firstName || profile?.lastName
                    ? `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim()
                    : profile?.username}
                </p>
                {profile?.bio ? (
                  <p className="mt-1 text-sm text-black/65">{profile.bio}</p>
                ) : null}
              </div>

              {me && me !== profile?.username && (
                <Button
                  onClick={onToggleFollow}
                  disabled={busy}
                  className="control-pill"
                >
                  {busy ? "…" : profile?.following ? "Unfollow" : "Follow"}
                </Button>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                to={`/u/${encodeURIComponent(username)}/followers`}
                className="control-pill"
              >
                Followers
              </Link>
              <Link
                to={`/u/${encodeURIComponent(username)}/following`}
                className="control-pill"
              >
                Following
              </Link>
            </div>
          </CardContent>
        </Card>

        {posts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {posts.map((p) => (
              <div
                key={p.id}
                className="space-y-2"
                onClick={(event) => openPostFromCard(event, p.id)}
              >
                <PostCard
                  post={p}
                  currentUsername={me}
                  authorMoodColor={dominantMoodColor}
                  onToggleLike={handleToggleLike}
                  onLoadComments={refreshComments}
                  onAddComment={handleAddComment}
                  onReplyComment={handleReplyComment}
                  onEditComment={handleEditComment}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
